import fontList from "font-list";
import * as vscode from "vscode";

let cachedFont: string[] = [];

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "font-selector.selectFont",
    async () => {
      try {
        const fonts = await getInstalledFonts();
        const selectedFont = await vscode.window.showQuickPick(fonts, {
          placeHolder: "Select a font for the editor",
          matchOnDescription: true,
          matchOnDetail: true,
        });
        if (selectedFont) {
          await updateEditorFont(selectedFont);
          vscode.window.showInformationMessage(
            `Font changed to ${selectedFont}`
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Error getting system font : ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function getInstalledFonts(refetch = false) {
  if (cachedFont.length !== 0 && !refetch) {
    return cachedFont;
  }
  try {
    const installedFonts = await fontList.getFonts();

    const processedFonts = installedFonts.map((font) => {
      return font.replace(/^['"]|['"]$/g, "");
    });

    cachedFont = [...new Set(processedFonts)].sort();
    return cachedFont;
  } catch (error) {
    throw error;
  }
}

async function updateEditorFont(fontFamily: string) {
  try {
    const config = vscode.workspace.getConfiguration("editor");

    await config.update(
      "fontFamily",
      fontFamily,
      vscode.ConfigurationTarget.Global
    );
  } catch (error) {
    throw error;
  }
}
export function deactivate() {}
