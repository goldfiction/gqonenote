// vvTODO: project crud
// vvTODO: section crud
// vvTODO: page crud
// vvTODO: note crud
// TODO: noteText crud
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
    $("#alertpopout").text(text)
    $("#alertpopout").fadeIn()
    setTimeout(function(){
        $("#alertpopout").fadeOut()
    },15000)
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
    editor.getSession().setMode("ace/mode/javascript")
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
            project.selectedTheme=response.theme
            $("#themes").val(project.selectedTheme).change()
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

project.updateList=function(projects){
    $("#projects").empty()
    projects.sort((a, b) => a.name.localeCompare(b.name));
    projects.forEach(element => {
        $("#projects").append(new Option(element.name, element.id));
    });
    $("#projects").append(new Option("package.json", "package.json"));
    project.selected = JSON.parse($("#projects").val())
    project.getSelectID(function (e,response) {
        //l(response)
            try {
                event = new Event('change', { bubbles: true });
                selectEl = document.getElementById('projects');
                $("#projects").val(JSON.parse(response.projectID));
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
                    $("#HTMLContent").html(atob(response[0].text))
                    editor.setValue(atob(response[0].text))
                    editor.renderer.updateFull();
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
    project.getSelectID(function (e,response) {
        try {
            $(".note[value='" + JSON.parse(response.noteID) + "']").trigger("click");
        } catch (e) { }
    })
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

note.text=function(){
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
inputStatus = null;

initOnEvent=function(){
    $('#projects').on('change', function () {
        project.selected = JSON.parse($("#projects").val())
        project.setSelectID({projectID:project.selected})

        section.list()
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
    initOnEvent()
    project.list()
    project.listTheme()
    attachControlKey("")
});