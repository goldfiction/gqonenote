// vvTODO: project crud
// vvTODO: section crud
// vvTODO: page crud
// vvTODO: note crud
// vvTODO: noteText crud
// 

l=console.log

project={}
section={}
page={}
note = {}
inputBox = {}
project.selected = null;
section.selected = null;
page.selected = null;
note.selected = null;
inputBox.hide = function () {
    $("#popupInputBox").addClass("fade")
}
inputBox.show = function () {
    $("#popupInputBox").removeClass("fade")
}

function maxEditor() { 
    $('#editor').addClass("ace_fullscreen")
}

function resetEditor() {
    try {
        $("#editor").removeClass("ace_fullscreen");
    } catch (e) { }
}

function toggleFullScreen() {
    if ($("#editor").hasClass("ace_fullscreen")) {
        resetEditor()
    } else { 
        maxEditor()
    }
}

function showalert(text){
    $("#alertpopout").html("<pre>"+text+"</pre>")
    $("#alertpopout").fadeIn()
    setTimeout(function(){
        $("#alertpopout").fadeOut()
    },15000)
}

function motd(text){
    $("#motd").html("<pre>"+text+"</pre>")
    $("#motd").fadeIn()
    setTimeout(function(){
        $("#motd").fadeOut()
    },4000)
}

function cleanID(id) {
    try {
        id=JSON.parse(proj)
    } catch (e) { }
    return id
}

function wget(url) {
    $.ajax({
        url: url,
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function (response) {
            l(response)
            showalert(response)
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
            l(response)
            showalert(response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
    return url
}


function attachControlKey(id="") {
    //chromeErrorHandler2()
    var editor = ace.edit("editor" + id);
    var currentFontSize = editor.getFontSize()
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
            note.text()
            //saveFile(id)
        } else if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
            event.preventDefault();
            console.log("Ctrl+r was pressed!");
            console.log("id is: "+id)
            //resetEditorPosition(id)
        } else if (event.altKey && event.key === "Enter") {
            event.preventDefault();
            console.log("Alt+Enter was pressed!");
            console.log("id is: " + id)
            toggleFullScreen(id)
        } else if (event.ctrlKey) { 
        }
    });
}

project.size = function () {
    $.ajax({
        url: '/size',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            alert("db size: "+response+" bytes")
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

project.runsh = function (script,shell,cb) {
    $.ajax({
        url: '/runsh',
        type: 'POST',
        data: {script:script,shell:shell},
        dataType: 'text', 
        success: function(response) {
            l('successful:', response);
            showalert(response)
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

project.motd = function (cb) {
    $.ajax({
        url: '/motd',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('get select id successful:', response);
            motd(response)
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });    
}

project.getSelectID = function (cb) {
    $.ajax({
        url: '/select',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('get select id successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });    
}

project.setSelectID = function (doc) {
    //l(doc)
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
    project.setSelectID({theme:theme})
}

project.appendTheme = function (themes) {
    themes.sort((a, b) => a.localeCompare(b));
    themes.forEach(element => {
        element=element.replace(".css", "")
        $("#themes").append(new Option(element, element));
    });
    $("#themes").on("change", function (event) {
        project.selectedTheme = $("#themes").val()
        selectTheme(project.selectedTheme)
    })
    project.getSelectID(function (e,response) {
        try {
            project.selectedTheme=response.theme||"monokai"
            $("#themes").val(project.selectedTheme).change()
        } catch (e) {
            l(e)
        }
    })
}

selectLanguage = function (lang = "javascript") {
    l("setting to language:",lang)
    editor.getSession().setMode("ace/mode/"+lang)
    project.setSelectID({language:lang})
}

project.appendLanguage = function (langs) {
    langs.sort((a, b) => a.localeCompare(b));
    langs.forEach(element => {
        element = element.replace(".js", "")
        element=element.replace("mode-", "")
        $("#languages").append(new Option(element, element));
    });
    $("#languages").on("change", function (event) {
        project.selectedLanguage = $("#languages").val()
        selectLanguage(project.selectedLanguage)
    })
    project.getSelectID(function (e,response) {
        try {
            project.selectedLanguage=response.language||"javascript"
            $("#languages").val(project.selectedLanguage).change()
        } catch (e) {
            l(e)
        }
    })
 }

project.listTheme = function (editor) {
    $("#themes").empty()
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

project.listLanguage = function (editor) {
    $("#languages").empty()
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

user=null
project.updateAdminTab = function () {
    $.ajax({
        url: '/user',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function (response) {
            user=response
            //l(response)
            if (response == "admin") {
                $("#tabContent2").removeClass("fade")
                $("#tabContent2").removeClass("hide")
                $("#tabContent2").removeClass("d-none")
                $("#tabContent2").show()
            }
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    }); 
}

project.updateList=function(projects){
    $("#projects").empty()
    projects.sort((a, b) => a.name.localeCompare(b.name));
    projects.forEach(element => {
        $("#projects").append(new Option(element.name, element.id));
    });
    if (user == "admin") {
        $("#projects").append(new Option("package.json", "package.json"));        
    }
    $("#projects").append(new Option("temp", "temp"));        

    project.selected = cleanID($("#projects").val())
    project.getSelectID(function (e,response) {
        //l(response)
        try {
            event = new Event('change', { bubbles: true });
            selectEl = document.getElementById('projects');
            $("#projects").val(cleanID(response.projectID))                        
            selectEl.dispatchEvent(event);
        } catch (e) {
            l(e)
        }
    })        
}

project.list=function(){
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

project.create=function(name,cb){
    $.ajax({
        url: '/project',
        type: 'POST',
        data: {name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            project.updateList(response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

project.remove=function(id,cb){
    $.ajax({
        url: '/project',
        type: 'DELETE',
        data: {id: id },
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

project.rename=function(id,name,cb){
    $.ajax({
        url: '/project',
        type: 'PUT',
        data: {id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

project.readPackage = function (cb) {
    $.ajax({
        url: '/package',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            editor.setValue(response)
            cb(null, response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

project.writePackage = function (cb) {
    $.ajax({
        url: '/package',
        type: 'PUT',
        data: {text:editor.getValue()},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

project.export = function (cb) {
    $.ajax({
        url: '/project/export',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            //editor.setValue(response)
            showalert("Project exported.")  
            cb(null, response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

project.import = function (cb) {
    $.ajax({
        url: '/project/import',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            //editor.setValue(response)
            if (response.status == "OK") {
                showalert("Project imported.")
                project.list()        
            }
            cb(null, response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

project.stop = function (cb) {
    $.ajax({
        url: '/server/stop',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            showalert("Server stopped.")
            cb()
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

project.restart = function (cb) {
    $.ajax({
        url: '/server/restart',
        type: 'GET',
        data: {},
        dataType: 'text', 
        success: function(response) {
            showalert("Server restarted.")
            cb()
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    }); 
}

//--

section.updateList=function(sections){
    $("#sections").html("")
    sections.sort((a, b) => a.name.localeCompare(b.name));
    sections.forEach(element => {
        $("#sections").append("<div class=\"selector section\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    project.getSelectID(function (e,response) {
        try {
            $(".section[value='" + JSON.parse(response.sectionID) + "']").trigger("click");                            
        } catch (e) { }
    })
    $(".section").on("click",function(elem){
        try {
            $('.section[value="'+section.selected+'"]').removeClass("selected")            
        } catch (e) { }
        section.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected")
        //l("selected section: " + section.selected)
        project.setSelectID({sectionID:section.selected})
        page.list()
    })
}

section.list=function(){
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

section.create=function(name,cb){
    $.ajax({
        url: '/section',
        type: 'POST',
        data: {project:project.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

section.remove=function(id,cb){
    $.ajax({
        url: '/section',
        type: 'DELETE',
        data: {id:id,project:project.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

section.rename=function(id,name,cb){
    $.ajax({
        url: '/section',
        type: 'PUT',
        data: {id:id,project:project.selected,name:name},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            cb(null,response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            cb(error)
        }
    });
}

//--

page.updateList=function(pages){
    $("#pages").html("")
    pages.sort((a, b) => a.name.localeCompare(b.name));
    pages.forEach(element => {
        $("#pages").append("<div class=\"selector page\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    project.getSelectID(function (e,response) {
        try {
            $(".page[value='" + JSON.parse(response.pageID) + "']").trigger("click");
         } catch (e){ }
    })
    $(".page").on("click",function(elem){
        try {
            $('.page[value="'+page.selected+'"]').removeClass("selected")            
        } catch (e) { }
        page.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected")
        //l("selected page: " + page.selected)
        project.setSelectID({pageID:page.selected})
        note.list()
    })
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
note.getText=function(){
    $.ajax({
        url: '/note/text',
        type: 'GET',
        data: {project:project.selected,section:section.selected,page:page.selected,id:note.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:', response);
            if (response.length == 1) {
                try {
                    hideEditor=!($("#editorPage").hasClass("active"))
                    $("#HTMLContent").html(atob(response[0].text))
                    $("#editorPage").addClass("show")
                    editor.setValue(atob(response[0].text))
                    editor.renderer.updateFull();
                    if (hideEditor) {
                        $("#editorPage").removeClass("show")
                    }
                } catch (e) {
                    editor.setValue("")
                }
            }
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

note.updateList=function(notes){
    $("#notes").html("")
    notes.sort((a, b) => a.name.localeCompare(b.name));
    notes.forEach(element => {
        $("#notes").append("<div class=\"selector note\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    //project.getSelectID(function (e,response) {
    //    try {
    //        $(".note[value='" + JSON.parse(response.noteID) + "']").trigger("click");
    //    } catch (e) { }
    //})
    $(".note").on("click",function(elem){
        try {
            $('.note[value="'+note.selected+'"]').removeClass("selected")            
        } catch (e) { }
        note.selected = elem.target.attributes.value.nodeValue
        $(this).addClass("selected")
        //l("selected note: " + note.selected)
        project.setSelectID({noteID:note.selected})
        note.getText()
        note.path()
        //editor.setValue(notes.filter((elem) => {return elem.id==JSON.parse(note.selected)}).text||"")
    })
}

note.list=function(){
    $.ajax({
        url: '/note',
        type: 'GET',
        data: {project:project.selected,section:section.selected,page:page.selected},
        dataType: 'json', 
        success: function(response) {
            //l('successful:',response);
            note.updateList(response)
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
            //note.updateList(response)
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
            //l('successful:',response);
            note.updateList(response)
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
            //l('successful:',response);
            note.updateList(response)
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
            //l('successful:',response);
            note.updateList(response)
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
            note.updateList(response)
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
            note.updateList(response)
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
                showalert("Note saved.")                
            }
        })
    } else {
        $.ajax({
            url: '/note/text',
            type: 'PUT',
            data: {project:project.selected,section:section.selected,page:page.selected,id:note.selected,text:btoa(editor.getValue())},
            dataType: 'json', 
            success: function(response) {
                //l('successful:',response);
                showalert("Note saved.")
            },
            error: function(xhr, status, error) {
                l('failed:', error);
            }
        });
        
    }
}

note.path = function () {
    $.ajax({
        url: '/note/path',
        type: 'GET',
        data: { project: project.selected, section: section.selected, page: page.selected, id: note.selected },
        dataType: 'text', 
        success: function(response) {
            //l('successful:', response);
            //alert("db size: "+response+" bytes")
            $("#notePath").html("xpath: "+response)
        },
        error: function(xhr, status, error) {
            l('failed:', error);
            //cb(error)
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
    $("#statusBar").append("<div id='clock2'></div>")
    setInterval(runClock, 300);
}

initCmdline = function () {
    $("#statusBar").append("<div id='cmdline2'></div>")
    $("#cmdline2").append("<input id='cmdlineInput' type='text'></input>")
}

//--
inputStatus = null;

initOnEvent=function(){
    $('#projects').on('change', function () {
        if ($("#projects").val().toLowerCase() == "package.json") {
            project.selected = $("#projects").val()
            project.setSelectID({projectID:project.selected})
            project.readPackage(function (e,r) { })
        }
        else {
            project.selected = JSON.parse($("#projects").val())
            project.setSelectID({projectID:project.selected})
            section.list()
        }
    });

    $("#saveNoteNav").on("click", function (elem) {
        note.text()
    })

    $("#dbSize").on("click", function (elem) {
        project.size()
    })

    $(".btn").on("click", function (elem) {
        //l(elem)
        if (elem.target.id == "addProject") {
            //l("addProject!")
            inputStatus="addProject"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removeProject") {
            project.remove(project.selected, function (e, response) {
                if (!e) {
                    project.updateList(response);
                }
            })
        }
        else if (elem.target.id == "editProject") {
            inputStatus = "editProject"
            $("#popupInput").val($("#projects option:selected").text())
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "export") {
            project.export(function (e,r) { })
        }
        else if (elem.target.id == "import") {
            project.import(function (e,r) { })
        }
        //--
        else if (elem.target.id == "addSection") {
            inputStatus="addSection"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removeSection") {
            section.remove(section.selected, function (e, response) {
                if (!e) {
                    section.list()
                }
            })
        }
        else if (elem.target.id == "editSection") {
            inputStatus="editSection"
            $("#popupInput").val($(".section.selected").text())
            $("#popupInputBox").removeClass("fade")
        }
        //--
        else if (elem.target.id == "addPage") {
            inputStatus="addPage"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removePage") {
            page.remove(page.selected, function (e, response) {
                if (!e) {
                    page.list()
                }
            })
        }
        else if (elem.target.id == "editPage") {
            inputStatus = "editPage"
            $("#popupInput").val($(".page.selected").text())
            $("#popupInputBox").removeClass("fade")
        }
        //--
        else if (elem.target.id == "addNote") {
            inputStatus="addNote"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removeNote") {
            note.remove(note.selected, function (e, response) {
                if (!e) {
                    note.list()
                }
            })
        }
        else if (elem.target.id == "editNote") {
            inputStatus = "editNote"
            $("#popupInput").val($(".note.selected").text())
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "saveNote") {
            note.text()
        }
        else if (elem.target.id == "saveAsNote") {
            inputStatus = "saveAsNote"
            $("#popupInput").val($(".note.selected").text())
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "duplicateNote") {
            note.duplicate($(".note[value='"+note.selected+"']").text(), $("#popupInput").val(), function (e, response) {
                $("#popupInput").val("")
                if (!e) {
                    note.list()
                }
            })
        }
        //--
        else if (elem.target.id == "cancelBtn") {
            $("#popupInputBox").addClass("fade")
            $("#popupInput").val("")
        }
        else if (elem.target.id == "run") {
            script = editor.getValue()
            if (script.indexOf("#!/bin/sh") != -1) {
                project.runsh(script,"/bin/sh", function (e,r) { })
            }
            else if (script.indexOf("#!/bin/bash") != -1) {
                project.runsh(script,"/bin/bash", function (e,r) { })
            }
            else if(script.indexOf("#!javascript")!=-1){
                project.runsh(script,"javascript", function (e,r) { })
            }
            else if(script.indexOf("#!coffeescript")!=-1){
                project.runsh(script,"coffeescript", function (e,r) { })
            }
            else if(script.indexOf("#!python")!=-1){
                project.runsh(script,"python", function (e,r) { })
            }
            else if(script.indexOf("#!lua")!=-1){
                project.runsh(script,"lua", function (e,r) { })
            }
        }
        else if (elem.target.id == "stop") {
            project.stop(function (e,r) { })
        }
        else if (elem.target.id == "restart") {
            project.restart(function (e,r) { })
        }
        else if (elem.target.id == "HTMLPageNav") {
            $("#editorPage").removeClass("active")
            $("#editorPage").removeClass("show")
        }
        else if (elem.target.id == "submitBtn") {
            //--
            if (inputStatus == "addProject") {
                $("#popupInputBox").addClass("fade")
                project.create($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                })
            } else if (inputStatus == "editProject") {
                $("#popupInputBox").addClass("fade")
                project.rename(project.selected, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        project.updateList(response)                        
                    }
                })
                //--
            } else if (inputStatus == "addSection") {
                $("#popupInputBox").addClass("fade")
                section.create($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        section.list()
                    }
                })
            } else if (inputStatus == "editSection") {
                $("#popupInputBox").addClass("fade")
                section.rename(section.selected, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        section.list()
                    }
                })
                //--
            } else if (inputStatus == "addPage") {
                $("#popupInputBox").addClass("fade")
                page.create($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        page.list()
                    }
                })
            } else if (inputStatus == "editPage") {
                $("#popupInputBox").addClass("fade")
                page.rename(page.selected, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        page.list()
                    }
                })
                //--
            } else if (inputStatus == "addNote") {
                $("#popupInputBox").addClass("fade")
                note.create($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        note.list()
                    }
                })
            } else if (inputStatus == "editNote") {
                $("#popupInputBox").addClass("fade")
                note.rename(note.selected, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        note.list()
                    }
                })
            } else if (inputStatus == "saveAsNote") {
                $("#popupInputBox").addClass("fade")
                note.saveas($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        note.list()
                    }
                })
            }

        }
    })

}
//--

$(document).ready(function () {
    project.motd(function (e, r) { })
    project.updateAdminTab()
    initOnEvent()
    project.list()
    project.listTheme()
    project.listLanguage()
    attachControlKey("")
    //note.listAll()
    initClock()
    initCmdline()
});