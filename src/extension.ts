'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { readdir } from 'fs';
import { resolve } from 'path';

export function activate(context: vscode.ExtensionContext) {
    var completeProvider = new CompleteProvider();
    var disposable = vscode.languages.registerCompletionItemProvider('*', 
    completeProvider, '"', '\'', '/');
	context.subscriptions.push(disposable);
}
/**
 *  CompleteProvider
 */
class CompleteProvider implements vscode.CompletionItemProvider{
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.CompletionItem[]>{

        var currentPath = getCurrentPath(document.fileName);
        let str = '';
        let line = document.lineAt(position);
        console.log(line);
        var lineText = document.getText(line.range);
        if(lineText.lastIndexOf('\'') > lineText.lastIndexOf('"')){
            var tempArr = lineText.substr(0, position.character).split('\'');  
        }else {
            var tempArr = lineText.substr(0, position.character).split('"');
        }
        str = tempArr[tempArr.length - 1];
        console.log(str);
        
        let src = resolve(currentPath, str);
        return new Promise((resolve, reject) => {
            let items: vscode.CompletionItem[];
            readdir(src, (err, data) => {
                if(err){
                    resolve([]);                    
                } else {
                    items = data.filter(item => {
                    return item[0] === '.' ? false : true;
                    }).map(item => {
                        return new vscode.CompletionItem(item);
                    });
                    resolve(items);
                }
            });
        });
    }
}

function getCurrentPath(fileName: string): string {
    var pathArray = fileName.split('/');
    pathArray.pop();
    return resolve.apply(null, pathArray);
}
// this method is called when your extension is deactivated
export function deactivate() {
}