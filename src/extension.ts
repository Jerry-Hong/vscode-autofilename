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

let configExtensionsTrim: Array<string> = [];
try {
    function updateConfigExtensionsTrim () {
        configExtensionsTrim = vscode.workspace.getConfiguration('autofilename.extensions').get('trim', []);
    }
    updateConfigExtensionsTrim();
    vscode.workspace.onDidChangeConfiguration(updateConfigExtensionsTrim);
} catch (ex) {
    configExtensionsTrim = [];
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
                            .filter(name => name[0] !== '.')
                            .map(name => {
                                const extn = name.includes('.') ? name.substring(name.lastIndexOf('.') + 1) : ''
                                if (extn !== '' && configExtensionsTrim.some(item => item.localeCompare(extn, 'en', { sensitivity: 'accent' }) === 0)) {
                                    name = name.substring(0, name.length - extn.length - 1);
                                }
                                const item = new vscode.CompletionItem(name);
                                item.kind = vscode.CompletionItemKind.File;
                                return item;
                            })
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

const getCurrentPath = (fileName: string) => fileName.substring(0, fileName.lastIndexOf(path.sep));

// this method is called when your extension is deactivated
export function deactivate() {
}
