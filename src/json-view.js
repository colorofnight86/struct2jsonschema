const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const util = require('./utils');
const jsonFactory = require('./jsonFactory')

/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {*} context 上下文
 * @param {*} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context, templatePath) {
    const resourcePath = util.getExtensionFileAbsolutePath(context, templatePath);
    const dirPath = path.dirname(resourcePath);
    let html = fs.readFileSync(resourcePath, 'utf-8');
    // vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
        return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
    });
    // console.log(html);
    return html;
}

/**
 * 从某个文件读取纯文本内容
 * @param {*} filePath 文件路径
 * @param {*} callback 回调函数
 */
function openLocalFile(filePath,callback) {
    let text;
    // 获取TextDocument对象
    vscode.workspace.openTextDocument(filePath)
        .then(doc => {
            text = doc.getText();
            callback(text);
        }, err => {
            console.log(`Open ${filePath} error, ${err}.`);
        }).then(undefined, err => {
            console.log(`Open ${filePath} error, ${err}.`);
        })
}

/**
 * 执行回调函数
 * @param {*} panel 
 * @param {*} message 
 * @param {*} resp 
 */
 function invokeCallback(panel, message, resp) {
    console.log('回调消息：', resp);
    // 错误码在400-600之间的，默认弹出错误提示
    if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
        util.showError(resp.message || '发生未知错误！');
    }
    panel.webview.postMessage({cmd: 'vscodeCallback', cbid: message.cbid, data: resp});
}

/**
 * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
 */
const messageHandler = {
    init(global, message, jsonSchema){
        util.showInfo("initialized");
        invokeCallback(global.panel, message, {code: 0, text: '成功', data: jsonSchema})
    },
    // 弹出提示
    alert(global, message) {
        util.showInfo(message.info);
    },
    // 显示错误提示
    error(global, message) {
        util.showError(message.info);
    },
    // 获取工程名
    getProjectName(global, message) {
        invokeCallback(global.panel, message, util.getProjectName(global.projectPath));
    },
    openFileInFinder(global, message) {
        // util.openFileInFinder(`${global.projectPath}/${message.path}`);
        // 这里的回调其实是假的，并没有真正判断是否成功
        invokeCallback(global.panel, message, {code: 0, text: '成功'});
    },
    openFileInVscode(global, message) {
        // util.openFileInVscode(`${global.projectPath}/${message.path}`, message.text);
        invokeCallback(global.panel, message, {code: 0, text: '成功'});
    },
    openUrlInBrowser(global, message) {
        util.openUrlInBrowser(message.url);
        invokeCallback(global.panel, message, {code: 0, text: '成功'});
    }
};

module.exports =function(context) {
    //注册webview
    context.subscriptions.push(vscode.commands.registerCommand('webview.jsonview',(uri)=>{
        vscode.window.showInformationMessage('show jsonview');

        const panel = vscode.window.createWebviewPanel(
            'Webview', // viewType
            "Struct的JSON Schema显示", // 视图标题
            vscode.ViewColumn.Two, // 显示在编辑器的哪个部位
            {
                enableScripts: true, // 启用JS，默认禁用
                retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
            }
        );
        try{
            let jsonSchema = ""
            let jsonSchema2 = {}

            // 读取当前文件的内容
            if(typeof(uri) != "undefined"){
                openLocalFile(uri.path,text=>{
                    var struct_list = util.extractStruct(text);
                    if(struct_list[0]){
                        let json = jsonFactory.schemaJoint(struct_list);
                        // let obj = JSON.parse(json);
                        // jsonSchema = JSON.stringify(obj);
                        jsonSchema = jsonFactory.schemaJoint(struct_list);
                        jsonSchema2 = {"property":{"led":{"led1":{"color":"blue","age":3},"led2":{"color":"green","age":1},"led3":{"color":"red","age":2}},"apple":{"apple1":{"size":"big"},"apple2":{"size":"small"}}}}
                    }
                    panel.webview.postMessage({cmd: 'dataLoad', data: jsonSchema});
                    // console.log(jsonSchema)
                    // console.log(JSON.stringify(jsonSchema))

                });
            }
            
            
            // panel.webview.html = getWebViewContent(context,'src/view/dist/index.html');
            panel.webview.html = getWebViewContent(context,'src/view/index.html');


            let global = { panel };
            //监听webview传来的消息
            panel.webview.onDidReceiveMessage(message => {
                if (messageHandler[message.cmd]) {
                    messageHandler[message.cmd](global, message);
                } else {
                    util.showError(`未找到名为 ${message.cmd} 回调方法!`);
                }
            }, undefined, context.subscriptions);

        }catch(err){
            console.log(err);
        }

    }));

};