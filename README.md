Voici un **README.md** professionnel, clair et optimisé pour le Marketplace de VS Code. Il met en avant la simplicité d'utilisation et précise bien les spécificités liées à macOS.

---

# Markdown Image Paster (Mac) 📸

**Markdown Image Paster** est une extension VS Code conçue pour simplifier la gestion des images dans vos fichiers Markdown. Copiez une image (capture d'écran, navigateur, aperçu) et collez-la directement avec `Cmd+V` : l'extension s'occupe de créer le fichier et d'insérer le lien.

> **Note :** Cette extension est optimisée exclusivement pour **macOS** (utilise AppleScript pour accéder au presse-papier).

---

## ✨ Fonctionnalités

* 🚀 **Collage Instantané** : Utilisez le raccourci natif `Cmd+V`. Si le presse-papier contient une image, elle est sauvegardée. Si c'est du texte, le comportement normal de VS Code est conservé.
* 📁 **Gestion automatique du dossier `res**` : Crée automatiquement un dossier `res/` pour stocker vos images si celui-ci n'existe pas.
* 🔗 **Lien relatif automatique** : Insère immédiatement le lien Markdown `![image-X.png](res/image-X.png)` à l'endroit de votre curseur.
* ⚙️ **Flexible** : Choisissez où stocker vos images via les paramètres.

---

## ⚙️ Configuration

L'extension propose une option de configuration pour s'adapter à votre structure de projet :

| Paramètre | Description | Défaut |
| --- | --- | --- |
| `mdPaster.saveAtRoot` | Si `true`, crée le dossier `res/` à la racine du workspace. Si `false`, le crée dans le dossier du fichier Markdown actif. | `false` |

---

## 🚀 Comment l'utiliser ?

1. Faites une capture d'écran (`Cmd+Ctrl+Shift+4`) ou copiez une image depuis votre navigateur.
2. Allez dans votre fichier `.md` sur VS Code.
3. Appuyez sur **`Cmd+V`**.
4. L'image est enregistrée dans le dossier `res/` et le lien est inséré.

---

## 🛠️ Installation

* Ouvrez VS Code.
* Allez dans l'onglet Extensions (`Ctrl+Shift+X`).
* Cherchez **"Markdown Image Paster (Mac)"**.
* Cliquez sur **Install**.

---

## 📋 Prérequis

* **Système d'exploitation** : macOS uniquement.
* **Permissions** : VS Code peut demander l'accès pour exécuter un script système lors du premier collage (AppleScript).

---

## 📝 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

**Une idée d'amélioration ?** N'hésitez pas à ouvrir une *issue* sur le dépôt GitHub !


