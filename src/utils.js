const fs = require('fs');
const os = require('os');
const path = require('path');
const vscode = require('vscode');
const exec = require('child_process').exec;


const util={
    /**
     * @description 提取C语言源文件中的结构体<br>
     * @param {string} content_raw - 待提取的源文件字符串
     * @returns {Array} 结构体字符串数组
     */
    //
    extractStruct(content_raw) {
        var struct_list=[]
        //去掉main函数和注释
        var content_file = content_raw
        content_file = content_file.replace(/\/\*(\s|.)*?\*\//g,"");
        content_file = content_file.replace(/(\s)*\/\/.*/g,"");
        content_file = content_file.replace(/.*main\((\s|\S)*/g,"");

        var content='';
        var keyword_start = 'struct';
        var num_struct = this.countStr(content_file, keyword_start);
        var keyword_middle = '}';
        var keyword_end = ';';
        var position_start = 0;
        var position_middle = 0;
        var position_end=0;
        var flag=0;
        // 依次查找结构体
        for (let i=0;i<num_struct;i++){
            let content_struct="";
            position_start = content_file.indexOf(keyword_start,position_start);
            position_middle = content_file.indexOf(keyword_middle, position_start);
            position_end = content_file.indexOf(keyword_end, position_middle);
            if (position_start !=-1){
                content_struct = content_file.slice(position_start,position_end+2);
                position_start += 1;
            }
            struct_list.push(content_struct);
            content = content + "\n" + content_struct;
        }
        // console.log(struct_list.toString());
        return struct_list;
    },

    //关键词计数
    countStr(srcStr, desStr) {
        var count=0;
        while(srcStr.indexOf(desStr) != -1 ) {
            srcStr = srcStr.replace(desStr,"");
            count++;    
        }
        return count;
    },

    /**
     * 获取某个扩展文件绝对路径
     * @param context 上下文
     * @param relativePath 扩展中某个文件相对于根目录的路径，如 images/test.jpg
     */
     getExtensionFileAbsolutePath: function(context, relativePath) {
        return path.join(context.extensionPath, relativePath);
    },

    /**
     * 弹出提示信息
     */
     showInfo: function(info) {
        vscode.window.showInformationMessage(info);
    },
    /**
     * 在vscode中打开某个文件
     * @param {*} path 文件绝对路径
     * @param {*} text 可选，如果不为空，则选中第一处匹配的对应文字
     */
     openFileInVscode: function(path, text) {
        let options = undefined;
        if (text) {
            const selection = this.getStrRangeInFile(path, text);
            options = { selection };
        }
        vscode.window.showTextDocument(vscode.Uri.file(path), options);
    },
    /**
     * 获取当前所在工程根目录，有3种使用方法：<br>
     * getProjectPath(uri) uri 表示工程内某个文件的路径<br>
     * getProjectPath(document) document 表示当前被打开的文件document对象<br>
     * getProjectPath() 会自动从 activeTextEditor 拿document对象，如果没有拿到则报错
     * @param {*} document 
     */
    getProjectPath(document) {
        if (!document) {
            document = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document : null;
        }
        if (!document) {
            this.showError('当前激活的编辑器不是文件或者没有文件被打开！');
            return '';
        }
        const currentFile = (document.uri ? document.uri : document).fsPath;
        let projectPath = null;

        let workspaceFolders = vscode.workspace.workspaceFolders.map(item => item.uri.path);
        // 由于存在Multi-root工作区，暂时没有特别好的判断方法，先这样粗暴判断
        // 如果发现只有一个根文件夹，读取其子文件夹作为 workspaceFolders
        if (workspaceFolders.length == 1 && workspaceFolders[0] === vscode.workspace.rootPath) {
            const rootPath = workspaceFolders[0];
            var files = fs.readdirSync(rootPath);
            workspaceFolders = files.filter(name => !/^\./g.test(name)).map(name => path.resolve(rootPath, name));
            // vscode.workspace.rootPath会不准确，且已过时
            // return vscode.workspace.rootPath + '/' + this._getProjectName(vscode, document);
        }
        workspaceFolders.forEach(folder => {
            folder = folder.replace(new RegExp("/","g"),'\\').substring(1);
            if (currentFile.indexOf(folder) === 0) {
                projectPath = folder;
            }
        })
        if (!projectPath) {
            this.showError('获取工程根路径异常！');
            return '';
        }
        return projectPath;
    },
    /**
     * 弹出错误信息
     */
    showError: function(info) {
        vscode.window.showErrorMessage(info);
    },
}

module.exports = util