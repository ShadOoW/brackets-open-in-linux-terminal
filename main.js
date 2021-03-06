/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, document, brackets, Mustache */

define(function (require, exports, module) {

    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        NodeDomain          = brackets.getModule("utils/NodeDomain"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        Commands            = brackets.getModule("command/Commands"),
        Menus               = brackets.getModule("command/Menus"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        PanelTemplate       = require("text!panel.html"),
        COMMAND_ID          = "openinterm.open",
        DIALOG_ID           = "openinterm.pref",
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        prefs               = PreferencesManager.getExtensionPrefs("openinterm"),
        term                = prefs.get("terminal");

    var openInTermDomain = new NodeDomain("openInTerm", ExtensionUtils.getModulePath(module, "node/OpenInTermDomain"));


    var initTerm = function() {

        if(!term) {
            openPrefDialog();
        }
    };

    var setPreferences = function () {
        var terminal = $('#openInTermSelect').val();

        prefs.set("terminal", terminal);
        prefs.save();
        CommandManager.execute(Commands.APP_RELOAD);
        //alert(terminal + " set as your terminal! \n\n Please reload extensions by pressing F5");

    };

    var openInTerm = function () {

        console.log("Entering in openInTerm with :" + term);

        var entry = ProjectManager.getProjectRoot();
        if (entry) {
            console.log("Entering in openInTerm, path: '" + entry.fullPath + "'");
            openInTermDomain.exec("startTerm", entry.fullPath, term)
                .done(function () {
                    console.log("Term successfully started, showing : '" + entry.fullPath + "'");
                })
                .fail(function (err) {
                    console.error("Error showing '" + entry.fullPath + "' in Term:", err);
                });
        }
        console.log("openInTerm end");

    };

    var openPrefDialog = function () {
        var localizedTemplate = Mustache.render(PanelTemplate);
        Dialogs.showModalDialogUsingTemplate(localizedTemplate);

        if (prefs.get('terminal')) {
            $('#openInTermSelect').val(term);
        }

        $('#openInTermSubmit').on('click', setPreferences);
    };

    CommandManager.register("Open in Terminal", COMMAND_ID, openInTerm);
    CommandManager.register("Set Terminal", DIALOG_ID, openPrefDialog);

    var menu1 = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    menu1.addMenuItem(COMMAND_ID);
    var menu2 = Menus.getContextMenu(Menus.ContextMenuIds.WORKING_SET_MENU);
    menu2.addMenuItem(COMMAND_ID);

    var menu3 = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
    menu3.addMenuDivider();
    menu3.addMenuItem(DIALOG_ID);


    /* Create Terminal Icon */
    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
    $(document.createElement("a"))
        .attr("id", "open-in-term-icon")
        .attr("href", "#")
        .attr("title", "Open in Terminal")
        .on("click", openInTerm)
        .appendTo($("#main-toolbar .buttons"));

    AppInit.extensionsLoaded(initTerm);

});
