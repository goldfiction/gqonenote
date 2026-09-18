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

project.create=function(name){
    $.ajax({
        url: '/project',
        type: 'POST',
        data: {name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

project.remove=function(id){
    $.ajax({
        url: '/project',
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

project.rename=function(id,name){
    $.ajax({
        url: '/project',
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

section.updateList=function(sections){
    $("#sections").html("")
    sections.forEach(element => {
        $("#sections").append("<div class=\"selector section\" value=\""+element.id+"\">"+element.name+"</div>");
    });
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

section.create=function(name){
    $.ajax({
        url: '/section',
        type: 'POST',
        data: {project:$("#projects").val(),name:name},
        dataType: 'json', 
        success: function(response) {
            l('successful:', response);
        },
        error: function(xhr, status, error) {
            l('failed:', error);
        }
    });
}

section.remove=function(id){
    $.ajax({
        url: '/section',
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

section.rename=function(id,name){
    $.ajax({
        url: '/section',
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
initOnEvent=function(){
    $('#projects').on('change', function() {
        //var selectedValue = $(this).val();
        //console.log("The selected value is: " + selectedValue);
        section.list()
        section.create("test")
    });

    $(".section").on("click",function($elem){
        l(elem)
    })

    $('#submitBtn').click(function() {
        // Read the text from the input field
        var userInput = $('#popupInput').val();
        
        // Do something with the text
        l(userInput);
        alert("You typed: " + userInput);
    });

}
//--

$(document).ready(function() {
    initOnEvent()

    //project.create("test")
    project.list()

});