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
        const currentPath = getCurrentPath(document.fileName);
        const lineAt = document.lineAt(position);
        const lineText = document.getText(lineAt.range);     
        let userKeyInStr = getUserKeyIn(lineText, position.character);
        let finalPath = resolve(currentPath, userKeyInStr);
        return new Promise((resolve, reject) => {
            let items: vscode.CompletionItem[];
            readdir(finalPath, (err, data) => {
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

function getUserKeyIn(lineText: string, toCharacter: number): string {
    let tempArr = [];
    if(lineText.lastIndexOf('\'') > lineText.lastIndexOf('"')){
        tempArr = lineText.substr(0, toCharacter).split('\'');  
    }else {
        tempArr = lineText.substr(0, toCharacter).split('"');
    }
    return tempArr[tempArr.length - 1];
}

function getCurrentPath(fileName: string): string {
    var pathArray = fileName.split('/');
    pathArray.pop();
    return resolve.apply(null, pathArray);
}
// this method is called when your extension is deactivated
export function deactivate() {
}