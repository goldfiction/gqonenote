ace.config.set('basePath', '/ace/src-min')
ace.require("ace/ext/language_tools");
StatusBar = ace.require("ace/ext/statusbar").StatusBar
var editor = ace.edit("editor", {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        mode: "ace/mode/javascript"
});
var provider = LanguageProvider.fromCdn("https://unpkg.com/ace-linters@latest/build/");
provider.registerEditor(editor);
editor.setTheme("ace/theme/monokai"); // Example theme
editor.session.setMode("ace/mode/javascript"); // Example mode
var statusBar = new StatusBar(editor, $("#statusBar")[0]);