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
    
    const docUri = editor.document.uri;
    const ws = vscode.workspace.getWorkspaceFolder(docUri);

    // --- SÉCURITÉ : Vérification du Workspace ---
    // Si l'utilisateur veut sauvegarder à la racine mais qu'aucun dossier n'est ouvert
    if (saveAtRoot && !ws) {
        vscode.window.showErrorMessage("Markdown Image Paster: Please open a workspace folder first to save at root.");
        return;
    }

    // Si le fichier n'est pas encore sauvegardé (Untitled) et qu'on ne sauvegarde pas à la racine
    if (editor.document.isUntitled && !saveAtRoot) {
        vscode.window.showErrorMessage("Please save your Markdown file first or enable 'Save At Root' in settings.");
        return;
    }

    // --- LOGIQUE DE CHEMIN ---
    let basePath: string;
    if (saveAtRoot && ws) {
        basePath = ws.uri.fsPath;
    } else {
        basePath = path.dirname(docUri.fsPath);
    }

    const targetDir = path.join(basePath, 'res');

    // --- CRÉATION DU DOSSIER ---
    try {
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to create 'res' folder: ${err}`);
        return;
    }

    // --- PRÉPARATION DU FICHIER ---
    const fileName = `image-${Date.now()}.png`;
    const filePath = path.join(targetDir, fileName);

    // --- EXÉCUTION APPLESCRIPT (macOS) ---
    // Utilisation de guillemets autour du chemin pour gérer les espaces
    const saveScript = `osascript -e 'set theFile to (POSIX file "${filePath}")' ` +
                        `-e 'tell application "System Events" to set theImage to (the clipboard as «class PNGf»)' ` +
                        `-e 'set theOpenFile to open for access theFile with write permission' ` +
                        `-e 'write theImage to theOpenFile' ` +
                        `-e 'close access theOpenFile'`;

    exec(saveScript, (err) => {
        if (err) {
            vscode.window.showErrorMessage("Clipboard does not contain a valid image or permission denied.");
            return;
        }

        // --- INSERTION DANS LE MARKDOWN ---
        // On calcule le chemin relatif entre le fichier MD et l'image sauvegardée
        let relativePath: string;
        
        if (editor.document.isUntitled) {
            // Si le document n'est pas encore sauvé, on met le chemin absolu ou relatif au WS
            relativePath = path.join('res', fileName);
        } else {
            relativePath = path.relative(path.dirname(docUri.fsPath), filePath);
        }
        
        editor.edit(editBuilder => {
            const link = `![${fileName}](${relativePath})`;
            editBuilder.insert(editor.selection.active, link);
        });

        vscode.window.setStatusBarMessage(`Image saved to ${targetDir}`, 3000);
    });
}