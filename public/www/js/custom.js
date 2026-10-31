// vvTODO: project crud
// vvTODO: section crud
// vvTODO: page crud
// vvTODO: note crud
// vvTODO: noteText crud
// 

l = console.log
n = null
nf = function(e,r){
  if(e) l(e);
}

project = {}
section = {}
page = {}
note = {}
inputBox = {}
temp = {}
project.selected = n
section.selected = n
page.selected = n
note.selected = n
inputBox.hide = function () {
    $("#popupInputBox").addClass("fade");
}
inputBox.show = function () {
    $("#popupInputBox").removeClass("fade");
}

function maxEditor() { 
    $('#editor').addClass("ace_fullscreen");
}

function resetEditor() {
    try {
        $("#editor").removeClass("ace_fullscreen");
    } catch (e) { }
}

function maxIframe() { 
    $('.iframe').addClass("ace_fullscreen");
}

function resetIframe() {
    try {
        $(".iframe").removeClass("ace_fullscreen");
    } catch (e) { }
}

function toggleFullScreen() {
    if ($("#editor").hasClass("ace_fullscreen")) {
        resetEditor();
    } else { 
        maxEditor();
    }
}

function toggleIframe() {
    if ($(".iframe").hasClass("ace_fullscreen")) {
        resetIframe();
    } else { 
        maxIframe();
    }

}

function attachIframeFullscreen(){
    $(document).on('keydown', function(e) {
        // Check if Alt + Enter is pressed
        if (e.altKey && e.key === 'Enter') {
            e.preventDefault();
            
            // Target your iframe (change the selector if needed)
            var iframe = $('iframe')[0]; 
            
            if (!iframe) return;

            // Toggle fullscreen
            if (!document.fullscreenElement) {
                if (iframe.requestFullscreen) {
                    iframe.requestFullscreen();
                } else if (iframe.webkitRequestFullscreen) { /* Safari */
                    iframe.webkitRequestFullscreen();
                } else if (iframe.msRequestFullscreen) { /* IE11 */
                    iframe.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
    });
}

function showalert(text){
    $("#alertpopout").html("<pre>"+text+"</pre>");
    $("#alertpopout").fadeIn();
    setTimeout(function(){
        $("#alertpopout").fadeOut();
    },15000);
}

function motd(text){
    $("#motd").html("<pre>"+text+"</pre>");
    $("#motd").fadeIn();
    setTimeout(function(){
        $("#motd").fadeOut();
    },4000);
}

function cleanID(id) {
    id2=id
    try {
        id2=JSON.parse(id);
    } catch (e) { }
    return id2
}

function wget(url) {
    $.ajax({
        url: url,
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function (response) {
            l(response);
            showalert(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
    return url
}

function wpost(url, data = {}) {
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'text', 
        success: function (response) {
            l(response);
            showalert(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
    return url
}

// generic ajax method
// input:o.url
// input:o.method
// input:o.data

function wajax(o = {},cb=nf) {
    $.ajax({
        url: o.url||"/",
        type: o.method||"GET",
        data: o.data || {},
        dataType: 'json', 
        success: function (response) {
            l(response);
            showalert(response);
            cb(null,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
    return url
}

function attachControlKey(id="") {
    //chromeErrorHandler2();
    var editor = ace.edit("editor" + id);
    var currentFontSize = editor.getFontSize();
    $("#editor" + id).keydown(function (event) {
        // Check if Ctrl key is pressed and the key is 'c' or 'C'
        if (event.ctrlKey && (event.key === '=' || event.key === '+')) {
            event.preventDefault(); // Prevent the default copy action if needed
            console.log("Ctrl++ was pressed!");
            currentFontSize++
            editor.setOptions({
                fontSize: currentFontSize + "px"
            });
        } else if (event.ctrlKey && (event.key === '-' || event.key === '_')) {
            event.preventDefault(); // Prevent the default copy action if needed
            console.log("Ctrl+- was pressed!");
            currentFontSize--
            editor.setOptions({
                fontSize: currentFontSize + "px"
            });
        } else if (event.ctrlKey && (event.key === 's' || event.key === 'S')) {
            event.preventDefault(); // Prevent the default copy action if needed
            console.log("Ctrl+s was pressed!");
            note.text();
            //saveFile(id);
        } else if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
            event.preventDefault();
            console.log("Ctrl+r was pressed!");
            //console.log("id is: "+id);
            //resetEditorPosition(id);
        } else if (event.altKey && event.key === "Enter") {
            event.preventDefault();
            //console.log("Alt+Enter was pressed!");
            //console.log("id is: " + id);
            toggleFullScreen(id);
        }
    });
}

project.size = function (cb=nf) {
    $.ajax({
        url: '/size',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            alert("db size: "+response+" bytes");
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

project.runsh = function (script,shell=null,cb=nf) {
    $.ajax({
        url: '/runsh',
        type: 'POST',
        data: {script:script,shell:shell},
        dataType: 'text', 
        success: function(response) {
            l('successful:', response);
            showalert(response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            //l('failed:', error);
            //l(xhr)
            //l(status)
            showalert(xhr.responseText.split("<br>")[0].trim())
            cb(error);
        }
    });
}

project.motd = function (cb=nf) {
    $.ajax({
        url: '/motd',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('get select id successful:', response);
            motd(response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });    
}

project.getSelectID = function (cb=nf) {
    $.ajax({
        url: '/select',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('get select id successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });    
}

project.setSelectID = function (doc,cb=nf) {
    //l(doc);
    $.ajax({
        url: '/select',
        type: 'PUT',
        data: doc,
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });    
}

selectTheme = function (theme="monokai") {
    editor.setTheme("ace/theme/" + theme);
    project.setSelectID({theme:theme});
}

project.appendTheme = function (themes) {
    themes.sort((a, b) => a.localeCompare(b));
    themes.forEach(element => {
        element=element.replace(".css", "");
        $("#themes").append(new Option(element, element));
    });
    $("#themes").on("change", function (event) {
        project.selectedTheme = $("#themes").val();
        selectTheme(project.selectedTheme);
        l("setting to theme: "+project.selectedTheme);
    });
    project.getSelectID(function (e,response) {
        try {
            project.selectedTheme=response.theme||"monokai"
            $("#themes").val(project.selectedTheme).change();
        } catch (e) {
            l(e);
        }
    });
}

selectLanguage = function (lang = "javascript") {
    l("setting to language:",lang);
    editor.getSession().setMode("ace/mode/"+lang);
    project.setSelectID({language:lang});
}

project.appendLanguage = function (langs) {
    langs.sort((a, b) => a.localeCompare(b));
    langs.forEach(element => {
        element = element.replace(".js", "");
        element=element.replace("mode-", "");
        $("#languages").append(new Option(element, element));
    });
    $("#languages").on("change", function (event) {
        project.selectedLanguage = $("#languages").val();
        selectLanguage(project.selectedLanguage);
    });
    project.getSelectID(function (e,response) {
        try {
            project.selectedLanguage=response.language||"javascript"
            $("#languages").val(project.selectedLanguage).change();
        } catch (e) {
            l(e);
        }
    });
}

project.listTheme = function (editor,cb=nf) {
    $("#themes").empty();
    $.ajax({
        url: '/theme',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            project.appendTheme(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });    
    
}

project.listLanguage = function (editor,cb=nf) {
    $("#languages").empty();
    $.ajax({
        url: '/language',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            project.appendLanguage(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });      
}

user=n
project.updateAdminTab = function (cb=nf) {
    $.ajax({
        url: '/user',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function (response) {
            user=response
            //l(response);
            if (response == "admin") {
                $("#tabContent2").removeClass("fade");
                $("#tabContent2").removeClass("hide");
                $("#tabContent2").removeClass("d-none");
                $("#tabContent2").show();
            }
            cb();
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.updateList=function(projects){
    $("#projects").empty();
    projects.sort((a, b) => a.name.localeCompare(b.name));
    projects.forEach(element => {
        $("#projects").append(new Option(element.name, element.id));
    });
    if (user == "admin") {
        $("#projects").append(new Option("package.json", "package.json"));
    }
    $("#projects").append(new Option("temp", "temp"));
    $("#projects").append(new Option("output.log", "output.log")); 

    project.selected = cleanID($("#projects").val());
    project.getSelectID(function (e,response) {
        //l(response);
        try {
            $("#projects").val(cleanID(response.projectID)).trigger('change');
        } catch (e) {
            //l(e);
        }
    });
}

project.list=function(cb=nf){
    $.ajax({
        url: '/project',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            project.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

project.create=function(name,cb=nf){
    $.ajax({
        url: '/project',
        type: 'POST',
        data: {name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            project.selected=cleanID(response.id)
            project.setSelectID({projectID:project.selected});
            project.updateList(response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

project.remove=function(id,cb=nf){
    $.ajax({
        url: '/project',
        type: 'DELETE',
        data: {id: id },
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

project.rename=function(id,name,cb=nf){
    $.ajax({
        url: '/project',
        type: 'PUT',
        data: {id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

project.readPackage = function (cb=nf) {
    $.ajax({
        url: '/package',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            editor.setValue(response);
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.writePackage = function (cb=nf) {
    $.ajax({
        url: '/package',
        type: 'PUT',
        data: {text:editor.getValue()},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.export = function (cb=nf) {
    $.ajax({
        url: '/project/export',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            //editor.setValue(response);
            showalert("Project exported.")  
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.import = function (cb=nf) {
    $.ajax({
        url: '/project/import',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            //editor.setValue(response);
            if (response.status == "OK") {
                showalert("Project imported.");
                project.list();
            }
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.stop = function (cb=nf) {
    $.ajax({
        url: '/server/stop',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            showalert("Server stopped.");
            cb();
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

project.restart = function (cb=nf) {
    $.ajax({
        url: '/server/restart',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            showalert("Server restarted.");
            cb();
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

//--

section.updateList=function(sections,cb=nf){
    $("#sections").html("");
    sections.sort((a, b) => a.name.localeCompare(b.name));
    sections.forEach(element => {
        $("#sections").append("<div class=\"selector section\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    project.getSelectID(function (e,response) {
        try {
            $(".section[value='" + cleanID(response.sectionID) + "']").trigger("click");
        } catch (e) { }
    });
    $(".section").on("click",function(elem){
        try {
            $('.section[value="'+section.selected+'"]').removeClass("selected");
        } catch (e) { }
        section.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected");
        //l("selected section: " + section.selected);
        project.setSelectID({sectionID:section.selected});
        page.list();
    });
}

section.list=function(cb=nf){
    $.ajax({
        url: '/section',
        type: 'GET',
        data: {project:project.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            section.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

section.create=function(name,cb=nf){
    $.ajax({
        url: '/section',
        type: 'POST',
        data: {project:project.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            section.selected=cleanID(response.id)
            project.setSelectID({sectionID:section.selected});
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

section.remove=function(id,cb=nf){
    $.ajax({
        url: '/section',
        type: 'DELETE',
        data: {id:id,project:project.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

section.rename=function(id,name,cb=nf){
    $.ajax({
        url: '/section',
        type: 'PUT',
        data: {id:id,project:project.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(n,response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

//--

page.updateList=function(pages){
    $("#pages").html("");
    pages.sort((a, b) => a.name.localeCompare(b.name));
    pages.forEach(element => {
        $("#pages").append("<div class=\"selector page\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    project.getSelectID(function (e,response) {
        try {
            $(".page[value='" + cleanID(response.pageID) + "']").trigger("click");
         } catch (e){ }
    });
    $(".page").on("click",function(elem){
        try {
            $('.page[value="'+page.selected+'"]').removeClass("selected");
        } catch (e) { }
        page.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected");
        //l("selected page: " + page.selected);
        project.setSelectID({pageID:page.selected});
        note.list();
    });
}

page.list=function(){
    $.ajax({
        url: '/page',
        type: 'GET',
        data: {project:project.selected,section:section.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            page.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

page.create=function(name){
    $.ajax({
        url: '/page',
        type: 'POST',
        data: {project:project.selected,section:section.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            page.selected=cleanID(response.id)
            project.setSelectID({pageID:page.selected});
            page.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

page.remove=function(id){
    $.ajax({
        url: '/page',
        type: 'DELETE',
        data: {project:project.selected,section:section.selected,id:id},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            page.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

page.rename=function(id,name){
    $.ajax({
        url: '/page',
        type: 'PUT',
        data: {project:project.selected,section:section.selected,id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            page.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

//--
note.getText=function(cb=nf){
    $.ajax({
        url: '/note/text',
        type: 'GET',
        data: {project:project.selected,section:section.selected,page:page.selected,id:note.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            if (response.length == 1) {
                try {
                    $("#editorPage").css("display", "");
                    $("#editorPage").removeClass("hide");
                    $("#editorPage").addClass("show");
                    hideEditor=!($("#editorPage").hasClass("active"));
                    content=atob(response[0].text)
                    $("#HTMLContent").html(content);
                    editor.setValue(content);
                    temp.lastContent=content  // update last content upon chooen a new note
                    attachEnterKeyCMD()
                    editor.renderer.updateFull();
                    if (hideEditor) {
                        $("#editorPage").removeClass("show");
                        $("#editorPage").addClass("hide");
                    }
                } catch (e) {
                    editor.setValue("");
                    console.log(e)
                }
            }
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.updateList=function(notes){
    $("#notes").html("");
    notes.sort((a, b) => a.name.localeCompare(b.name));
    notes.forEach(element => {
        $("#notes").append("<div class=\"selector note\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    project.getSelectID(function (e,response) {
        try {
            $(".note[value='" + cleanID(response.noteID) + "']").trigger("click");
        } catch (e) { }
    });
    $(".note").on("click",function(elem){
        try {
            $('.note[value="'+note.selected+'"]').removeClass("selected");
        } catch (e) { }
        note.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected");
        //l("selected note: " + note.selected);
        project.setSelectID({noteID:note.selected});
        note.getText();
        note.path(function(e,r){});
        //editor.setValue(notes.filter((elem) => {return elem.id==cleanID(note.selected)}).text||"");
    });
}

note.list=function(){
    $.ajax({
        url: '/note',
        type: 'GET',
        data: {project:project.selected,section:section.selected,page:page.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.listAll=function(){
    $.ajax({
        url: '/note/all',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            l('successful:',response);
            //note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.create=function(name){
    $.ajax({
        url: '/note',
        type: 'POST',
        data: {project:project.selected,section:section.selected,page:page.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            note.selected=cleanID(response.id)
            project.setSelectID({noteID:note.selected});
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.saveas=function(name){
    $.ajax({
        url: '/note',
        type: 'POST',
        data: {project:project.selected,section:section.selected,page:page.selected,name:name,text:btoa(editor.getValue())},
        dataType: 'json', 
        success: function(response) {
            note.selected=cleanID(response.id)
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.duplicate=function(name){
    $.ajax({
        url: '/note',
        type: 'POST',
        data: {project:project.selected,section:section.selected,page:page.selected,name:"copy of "+name,text:btoa(editor.getValue())},
        dataType: 'json', 
        success: function(response) {
            note.selected=cleanID(response.id)
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.remove=function(id){
    $.ajax({
        url: '/note',
        type: 'DELETE',
        data: {project:project.selected,section:section.selected,page:page.selected,id:id},
        dataType: 'json', 
        success: function(response) {
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.rename=function(id,name){
    $.ajax({
        url: '/note',
        type: 'PUT',
        data: {project:project.selected,section:section.selected,page:page.selected,id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:',response);
            note.updateList(response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.text = function () {
    if (project.selected == "package.json") {
        project.writePackage(function (e, r) {
            if (e) {
                l('failed:', e);
            } else {
                showalert("Note saved.");
            }
        });
    } else {
        $.ajax({
            url: '/note/text',
            type: 'PUT',
            data: {project:project.selected,section:section.selected,page:page.selected,id:note.selected,text:btoa(editor.getValue())},
            dataType: 'json', 
            success: function(response) {
                //l('successful:',response);
                showalert("Note saved.");
            },
            error: function(xhr, status, error) {
                l('failed:', error);
            }
        });
        
    }
}

note.path = function (cb=nf) {
    $.ajax({
        url: '/note/path',
        type: 'GET',
        data: { project: project.selected, section: section.selected, page: page.selected, id: note.selected },
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            $("#notePath").html("xpath: "+response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    });
}

//--

temp.save = function (cb=nf) {
    $.ajax({
        url: '/temp',
        type: 'POST',
        data: {id:1,text:btoa(editor.getValue())},
        dataType: 'text', 
        success: function(response) {
            showalert("Temp file backed up.")  
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

temp.lastContent=n
temp.deposit = function () {
    temp.currentContent = editor.getValue();
    if (temp.lastContent != temp.currentContent) {
        temp.save(nf);
        temp.lastContent=temp.currentContent
    }
}

temp.get = function (cb=nf) {
    $.ajax({
        url: '/temp',
        type: 'GET',
        data: {id:1},
        dataType: 'json', 
        success: function(response) {
            if (response.status == "OK") {
                showalert("Temp file retrieved.");
                l(response);
            }
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

temp.retrieve = function (cb=nf) {
    temp.get(function (e, r) {
        //l(r);
        if (!e&&r.length) {
            editor.setValue(atob(r[0].text));
            temp.lastContent=editor.getValue();
        }
        cb();
    });
}

temp.period = function () {
    temp.intervalTicker=setInterval(function () {
        temp.deposit();
    },60*1000*10);
}

temp.timeout = function () {
    temp.timeoutTicker=setTimeout(function () {
        temp.period();
    },60*1000*10);
}

temp.retrieveLog = function (cb=nf) {
    $.ajax({
        url: '/output',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            showalert("output.log retrieved.");
            //l(response);
            editor.setValue(response.text);
            temp.lastContent=editor.getValue();
            cb(n, response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error);
        }
    }); 
}

//--

function runClock() {
    const timeNow = new Date();
    let hours = timeNow.getHours();
    let minutes = timeNow.getMinutes();
    let seconds = timeNow.getSeconds();
    let period = "AM";

    // Convert 24-hour format to 12-hour format
    if (hours >= 12) {
        period = "PM";
    }
    if (hours > 12) {
        hours = hours - 12;
    }
    if (hours === 0) {
        hours = 12;
    }

    // Pad single digits with leading zeros
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Combine into a readable time string
    const timeString = `${hours}:${minutes}:${seconds} ${period}`;
    
    // Inject the string into our HTML element
    document.getElementById("clock2").textContent = timeString;
}

initClock = function () {
    $("#statusBar").append("<div id='clock2'></div>");
    setInterval(runClock, 300);
}

initCmdline = function () {
    $("#statusBar").append("<div id='cmdline2'></div>");
    $("#cmdline2").append("<label>CMD: </label><input id='cmdlineInput' type='text'></input>");
    attachEnterKeyCMD()
}

//--
inputStatus = n;

confirmDialog = function (o, cb=nf) {
    $("#popupConfirmBox").removeClass("fade");
    $("#confirmYesBtn").on("click", function (elem) {
        $("#popupConfirmBox").addClass("fade");
        cb(null,true);
    });
    $("#confirmNoBtn").on("click", function (elem) {
        $("#popupConfirmBox").addClass("fade");
        cb(null,false);
    });
}

attachEnterKey = function () {
    $('#popupInput').off("keydown");
    $('#popupInput').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Stop standard browser submit
            $("#submitBtn").click();
        }
    });
}

attachEnterKeyCMD = function () {
    $('#cmdline2').on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Stop standard browser submit
            script = $("#cmdlineInput").val();
            project.runsh(script,"sh");
        }
    });
}

initOnEvent=function(){
    $('#projects').on('change', function () {
        if ($("#projects").val().toLowerCase() == "package.json") {
            project.selected = $("#projects").val();
            project.setSelectID({projectID:project.selected});
            project.readPackage(function (e,r) { });
        } else if ($("#projects").val().toLowerCase() == "temp") {
            project.selected = $("#projects").val();
            project.setSelectID({projectID:project.selected});
            temp.retrieve(function (e,r) { });
        } else if ($("#projects").val().toLowerCase() == "output.log") {
            project.selected = $("#projects").val();
            project.setSelectID({projectID:project.selected});
            temp.retrieveLog(function (e,r) { });
        } else {
            project.selected = cleanID($("#projects").val());
            project.setSelectID({projectID:project.selected});
            section.list();
        }
    });

    $("#saveNoteNav").on("click", function (elem) {
        note.text();
    });

    $("#dbSize").on("click", function (elem) {
        project.size();
    });

    $(".btn").on("click", function (elem) {
        //l(elem);
        if (elem.target.id == "addProject") {
            //l("addProject!");
            inputStatus="addProject"
            $("#popupInputBox").removeClass("fade");
            attachEnterKey();
        }
        else if (elem.target.id == "removeProject") {
            confirmDialog({}, function (e, choice) {
                if (choice) {
                    project.remove(project.selected, function (e, response) {
                        if (!e) {
                            project.updateList(response);
                        }
                    });
                }
            });
        }
        else if (elem.target.id == "editProject") {
            inputStatus = "editProject"
            $("#popupInputBox").removeClass("fade");
            attachEnterKey();
            $("#popupInput").val($("#projects option:selected").text());
        }
        else if (elem.target.id == "refreshProject") {
            $("#projects").trigger('change');
        }
        else if (elem.target.id == "export") {
            project.export(function (e,r) { });
        }
        else if (elem.target.id == "import") {
            project.import(function (e,r) { });
        }
        //--
        else if (elem.target.id == "addSection") {
            inputStatus="addSection"
            $("#popupInputBox").removeClass("fade");
            attachEnterKey();
        }
        else if (elem.target.id == "removeSection") {
            confirmDialog({}, function (e, choice) {
                if (choice) {
                    section.remove(section.selected, function (e, response) {
                        if (!e) {
                            section.list();
                        }
                    });
                }
            });
        }
        else if (elem.target.id == "editSection") {
            inputStatus="editSection"
            $("#popupInputBox").removeClass("fade");
            $("#popupInput").val($(".section.selected").text());
            attachEnterKey();
        }
        //--
        else if (elem.target.id == "addPage") {
            $("#popupInputBox").removeClass("fade");
            attachEnterKey();
            inputStatus="addPage"
        }
        else if (elem.target.id == "removePage") {
            confirmDialog({}, function (e, choice) {
                if (choice) {
                    page.remove(page.selected, function (e, response) {
                        if (!e) {
                            page.list();
                        }
                    });
                }
            });
        }
        else if (elem.target.id == "editPage") {
            inputStatus = "editPage"
            $("#popupInputBox").removeClass("fade");
            $("#popupInput").val($(".page.selected").text());
            attachEnterKey();
        }
        //--
        else if (elem.target.id == "addNote") {
            inputStatus="addNote"
            $("#popupInputBox").removeClass("fade");
            attachEnterKey();
        }
        else if (elem.target.id == "removeNote") {
            confirmDialog({}, function (e, choice) {
                if (choice) {
                    note.remove(note.selected, function (e, response) {
                        if (!e) {
                            note.list();
                        }
                    });
                }
            });
        }
        else if (elem.target.id == "editNote") {
            inputStatus = "editNote"
            $("#popupInputBox").removeClass("fade");
            $("#popupInput").val($(".note.selected").text());
            attachEnterKey();
        }
        else if (elem.target.id == "saveNote") {
            note.text();
        }
        else if (elem.target.id == "saveAsNote") {
            inputStatus = "saveAsNote"
            $("#popupInputBox").removeClass("fade");
            $("#popupInput").val($(".note.selected").text());
            attachEnterKey();
        }
        else if (elem.target.id == "duplicateNote") {
            note.duplicate($(".note[value='"+note.selected+"']").text(), $("#popupInput").val(), function (e, response) {
                $("#popupInput").val("");
                if (!e) {
                    note.list();
                }
            });
        }
        //--
        else if (elem.target.id == "cancelBtn") {
            $("#popupInput").val("");
            $("#popupInputBox").addClass("fade");
        }
        else if (elem.target.id == "run") {
            script = editor.getValue();
            project.runsh(script);
        }
        else if (elem.target.id == "stop") {
            project.stop(function (e,r) { });
        }
        else if (elem.target.id == "restart") {
            project.restart(function (e,r) { });
        }
        else if (elem.target.id == "HTMLPageNav") {
            $("#editorPage").removeClass("active");
            $("#editorPage").removeClass("show");
            $("#editorPage").addClass("hide");
        }
        else if (elem.target.id == "expand") {
            if($("#mainbar").hasClass("col-md-10")){
                $("#sidebar").addClass("hide")
                $("#mainbar").removeClass("col-md-10")
                $("#mainbar").addClass("col-md-12")
                $("#expand").text(">>")
            }else{
                $("#sidebar").removeClass("hide")
                $("#mainbar").removeClass("col-md-12")
                $("#mainbar").addClass("col-md-10")
                $("#expand").text("<<")
            }
        }
        else if (elem.target.id == "fullIframe") {
            toggleIframe()
        }
        else if (elem.target.id == "submitBtn") {
            //--
            if (inputStatus == "addProject") {
                projectName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                project.create(projectName, function (e, response) {
                    $("#popupInput").val("");
                });
            } else if (inputStatus == "editProject") {
                projectName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                project.rename(project.selected, projectName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        project.updateList(response);
                    }
                });
                //--
            } else if (inputStatus == "addSection") {
                sectionName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                section.create(sectionName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        section.list();
                    }
                });
            } else if (inputStatus == "editSection") {
                sectionName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                section.rename(section.selected,sectionName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        section.list();
                    }
                });
                //--
            } else if (inputStatus == "addPage") {
                pageName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                page.create(pageName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        page.list();
                    }
                });
            } else if (inputStatus == "editPage") {
                pageName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                page.rename(page.selected, pageName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        page.list();
                    }
                });
                //--
            } else if (inputStatus == "addNote") {
                noteName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                note.create(noteName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        note.list();
                    }
                });
            } else if (inputStatus == "editNote") {
                noteName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                note.rename(note.selected, noteName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        note.list();
                    }
                });
            } else if (inputStatus == "saveAsNote") {
                noteName=$("#popupInput").val();
                $("#popupInputBox").addClass("fade");
                note.saveas(noteName, function (e, response) {
                    $("#popupInput").val("");
                    if (!e) {
                        note.list();
                    }
                });
            }

        }
    });

}
//--

$(document).ready(function () {
    project.motd(function (e, r) { });
    initOnEvent();
    project.updateAdminTab(function (e, r) {
        project.list();
    });
    project.listTheme();
    project.listLanguage();
    attachControlKey("");
    //note.listAll();
    initClock();
    initCmdline();
    attachIframeFullscreen();
    temp.timeout();
});