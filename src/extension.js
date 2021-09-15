// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// let disposable = vscode.commands.registerCommand('helloworld.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World from HelloWorld!');
	// });
	// context.subscriptions.push(disposable);

	let CharacterCounter = require('./characterCounter');
	let counter = new CharacterCounter(vscode)

	context.subscriptions.push(counter);

	require('./json-view')(context);

}

// this method is called when your extension is deactivated
function deactivate() {
	console.log('插件已释放');
}

exports.activate = activate;
exports.deactivate = deactivate;
