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
note={}

project.updateList=function(projects){
    $("#projects").empty()
    projects.forEach(element => {
        $("#projects").append(new Option(element.name, element.id));
    });
}

project.list=function(){
    $.ajax({
        url: '/project',
        type: 'GET',
        data: {},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
            l('successful:', response);
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
            l('successful:', response);
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
            l('successful:', response);
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
    sections.forEach(element => {
        $("#sections").append("<div class=\"selector section\" value=\""+element.id+"\">"+element.name+"</div>");
    });
    $(".section").on("click",function(elem){
        try {
            $('.section[value="'+selectedSection+'"]').removeClass("selected")            
        } catch (e) { }
        selectedSection = elem.target.attributes.value.nodeValue
        $(this).addClass("selected")
        l("selected section: " + selectedSection)
        page.list()
    })
}

section.list=function(){
    $.ajax({
        url: '/section',
        type: 'GET',
        data: {project:$("#projects").val()},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {project:$("#projects").val(),name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id,project:$("#projects").val()},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id,project:$("#projects").val(),name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
    pages.forEach(element => {
        $("#pages").append("<div class=\"selector page\" value=\""+element.id+"\">"+element.name+"</div>");
    });
}

page.list=function(){
    $.ajax({
        url: '/page',
        type: 'GET',
        data: {project:$("#projects").val(),section:selectedSection},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
            $("#pages").html("")
            response.forEach(element => {
                $("#pages").append("<div class=\"selector\" value=\""+element.id+"\">"+element.name+"</div>");
            });
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
        data: {project:$("#projects").val(),section:selectedSection,name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

//--

note.updateList=function(notes){
    $("#notes").html("")
    notes.forEach(element => {
        $("#notes").append("<div class=\"selector note\" value=\""+element.id+"\">"+element.name+"</div>");
    });
}

note.list=function(){
    $.ajax({
        url: '/note',
        type: 'GET',
        data: {project:$("#projects").val(),section:selectedSection,page:selectedPage},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {project:$("#projects").val(),section:selectedSection,page:selectedPage,name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
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
        data: {id:id,name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

//--
inputStatus = null;

initOnEvent=function(){
    $('#projects').on('change', function() {
        section.list()
    });

    $(".btn").on("click",function(elem){
        l(elem)
        if (elem.target.id == "addProject") {
            //l("addProject!")
            inputStatus="addProject"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removeProject") {
            project.remove($("#projects").val(), function (e, response) {
                if (!e) {
                    project.updateList(response);
                }
            })
        }
        else if (elem.target.id == "editProject") {
            inputStatus="editProject"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "addSection") {
            inputStatus="addSection"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removeSection") {
            section.remove(selectedSection, function (e, response) {
                if (!e) {
                    section.list()
                }
            })
        }
        else if (elem.target.id == "editSection") {
            inputStatus="editSection"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "addPage") {
            inputStatus="addPage"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "removePage") {
            page.remove(selectedPage, function (e, response) {
                if (!e) {
                    page.list()
                }
            })
        }
        else if (elem.target.id == "editPage") {
            inputStatus="editPage"
            $("#popupInputBox").removeClass("fade")
        }
        else if (elem.target.id == "cancelBtn") {
            $("#popupInputBox").addClass("fade")
            $("#popupInput").val("")
        }
        else if (elem.target.id == "submitBtn") {
            if (inputStatus == "addProject") {
                $("#popupInputBox").addClass("fade")
                project.create($("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                })
            } else if (inputStatus == "editProject") {
                $("#popupInputBox").addClass("fade")
                project.rename($("#projects").val(), $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        project.updateList(response)                        
                    }
                })
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
                section.rename(selectedSection, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        section.list()
                    }
                })
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
                page.rename(selectedPage, $("#popupInput").val(), function (e, response) {
                    $("#popupInput").val("")
                    if (!e) {
                        page.list()
                    }
                })
            }

        }
    })

}
//--

$(document).ready(function() {
    initOnEvent()

    //project.create("test")
    project.list()
    //section.list()

});