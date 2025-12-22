import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('mdPaster.pasteImage', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor){
			return;
		}

        // Script AppleScript pour vérifier si le presse-papier contient une image
        // On essaie d'extraire l'image, si ça échoue, c'est probablement du texte
        const checkImageScript = `osascript -e 'get (clipboard info)'`;

        exec(checkImageScript, (err, stdout) => {
            if (stdout.includes('«class PNGf»') || stdout.includes('«class TIFF»')) {
                // C'EST UNE IMAGE : On lance ton workflow personnalisé
                saveAndPasteImage(editor);
            } else {
                // C'EST DU TEXTE : On délègue au comportement par défaut de VS Code
                vscode.commands.executeCommand('editor.action.clipboardPasteAction');
            }
        });
    });

    context.subscriptions.push(disposable);
}

async function saveAndPasteImage(editor: vscode.TextEditor) {
    const config = vscode.workspace.getConfiguration('mdPaster');
    const saveAtRoot = config.get<boolean>('saveAtRoot');
    
    let targetDir: string;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    
    if (saveAtRoot && workspaceFolder) {
        targetDir = path.join(workspaceFolder.uri.fsPath, 'res');
    } else {
        targetDir = path.join(path.dirname(editor.document.uri.fsPath), 'res');
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `image-${Date.now()}.png`;
    const filePath = path.join(targetDir, fileName);

    const saveScript = `osascript -e 'set theFile to (POSIX file "${filePath}")' -e 'tell application "System Events" to set theImage to (the clipboard as «class PNGf»)' -e 'set theOpenFile to open for access theFile with write permission' -e 'write theImage to theOpenFile' -e 'close access theOpenFile'`;

    exec(saveScript, (err) => {
        if (!err) {
            const relativePath = path.relative(path.dirname(editor.document.uri.fsPath), filePath);
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, `![${fileName}](${relativePath})`);
            });
        }
    });
}