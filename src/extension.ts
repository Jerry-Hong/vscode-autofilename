'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    var completeProvider = new CompleteProvider();
    vscode.languages.getLanguages().then(data => console.log(data))
    var disposable = vscode.languages.registerCompletionItemProvider('*', 
    completeProvider, '"', '\'', '/');
	context.subscriptions.push(disposable);
}


/**
 *  CompleteProvider
 */
class CompleteProvider implements vscode.CompletionItemProvider{
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]>{
        const currentPath = getCurrentPath(document.fileName);
        const lineText = document.getText(document.lineAt(position).range);   
        const userKeyInStr = getUserKeyIn(lineText, position.character);
        const finalPath = path.resolve(currentPath, userKeyInStr);
        return new Promise((resolve, reject) => {
            fs.access(finalPath, fs.F_OK, (err) => {
                const realPath = err ? getCurrentPath(finalPath): finalPath;
                fs.readdir(realPath, (err, data) => {
                    if(err){
                        reject();                    
                    } else {
                        data.unshift(''); // hack .ts file, first one is empty string and it will be correct when user typing dot 
                        resolve(data
                            .filter(item => item[0] !== '.')
                            .map(item => new vscode.CompletionItem(item, vscode.CompletionItemKind.File))
                        );
                    }
                });
            });
        });
    }
}

function getUserKeyIn(lineText: string, toCharacter: number): string {
    let tempArr = lineText.lastIndexOf('\'') > lineText.lastIndexOf('"') ? 
        lineText.substr(0, toCharacter).split('\'') : 
        lineText.substr(0, toCharacter).split('"');
    return tempArr[tempArr.length - 1];
}

const getCurrentPath = (fileName: string) => fileName.substring(0, fileName.lastIndexOf('/'));

// this method is called when your extension is deactivated
export function deactivate() {
}