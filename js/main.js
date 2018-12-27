// constantes
const server = "http://192.168.1.15/APPTickets/server.malaltsControl/malaltsControl/";



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        var idtel = device.uuid;
        alert(idtel);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function escanear(){
    cordova.plugins.barcodeScanner.scan(
      function (result) {
            $('#codigo').val(result.text);
            enviarCodigo();
          // alert("Tenemos un código\n" +
          //       "Result: " + result.text + "\n" +
          //       "Format: " + result.format + "\n" +
          //       "Cancelled: " + result.cancelled);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          preferFrontCamera : false, // iOS and Android
          showFlipCameraButton : true, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          prompt : "Apunta hacia el código", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS
      }
   );
}

function enviarCodigo(){
    var code = $('#codigo').val();
    var event = $('.chivato-evento').text();

    console.log(code);

    // var dato = '{"datos":[{"id_reserva":"69","id_event":"110","id_producte":"14","nom_producte":"Entrada + 2 consumicions","pagat":"35","nom_client":"Adrià Soriano Serrano","tel_client":"680611199","correu_client":"soriano.adria@gmail.com","dni":"47732214S","n_pedido":"170430205430","cod_barras":"170430205430-2","entrado":"0"}]}';
    //     console.log(dato);

    $.post( server + "consulta.php", { code: code , event: event }, function( data ){
        console.log(data);
        if(data.datos.length==0){
          // error codigo no válido
          $( ".valida-datos" ).html( "<i class='fa fa-exclamation-circle'></i> El código introducido no es válido." );
          $('.botonera-principal').css('display', 'none');
          $('.btn-reset').css('display', 'block');
          $('#valida-error').css("display", "block");
          $('#consola').html("<i class='fa fa-times icon-consola'></i> " + $('#codigo').val()+ " - CÓDIGO INVÁLIDO");
          $('footer').removeClass('footer-ok').addClass('footer-error');

        }
        else{
          cliente = data.datos[0];
          if(cliente.entrado==0){
            //ok
            $( ".valida-datos" ).html( "<b>" + cliente.nom_client + "</b><br>");
            $( ".valida-datos" ).append(cliente.dni + "<br>");
            $( ".valida-datos" ).append("<span class='concepto'>"+cliente.nom_producte +" - "+ cliente.pagat + "€</span><br>");
            // $( ".valida-datos" ).append("<span>"+cliente.pagat + "</span><br>");
            $('.botonera-principal').css('display', 'none');
            $('.btn-devolucion').css('display', 'block');
            $('.btn-validar').css('display', 'block');
            $('#valida-ok').css("display", "block");
          }
          else if(cliente.entrado==1){
            //error codigo usado
            $( ".valida-datos" ).html( "<b>"+cliente.nom_client+"</b><br><i class='fa fa-exclamation-circle'></i> El código introducido ya ha sido usado.<br>"+cliente.registro );
            $('.botonera-principal').css('display', 'none');
            $('.btn-reset').css('display', 'block');
            $('#valida-error').css("display", "block");
            $('#consola').html("<i class='fa fa-times icon-consola'></i> " + $('#codigo').val()+ " - YA HA SIDO USADO");
            $('footer').removeClass('footer-ok').addClass('footer-error');
          }
          else if(cliente.entrado==2){
            //error codigo usado
            $( ".valida-datos" ).html( "<b>"+cliente.nom_client+"</b><br><i class='fa fa-exclamation-circle'></i> Ya se ha realizado la devolución previamente para el código introducido.<br>"+cliente.registro );
            $('.botonera-principal').css('display', 'none');
            $('.btn-reset').css('display', 'block');
            $('#valida-error').css("display", "block");
            $('#consola').html("<i class='fa fa-times icon-consola'></i> " + $('#codigo').val()+ " - YA HA SIDO DEVUELTO!!!");
            $('footer').removeClass('footer-ok').addClass('footer-warning');
          }
        }


    }, "json");
}

function resetear(){
  //resetear sistema
  $('#codigo').val("");
  $('#valida-ok').css("display", "none");
  $('#valida-error').css("display", "none");
  $('.botonera-principal').css('display', 'inline');
  $('.btn-reset').css('display', 'none');
  $('.btn-validar').css('display', 'none');
  $('.btn-devolucion').css('display', 'none');

  $( ".valida" ).html( "" );
}
function validar(){
  // funcion que actualiza la bbdd a entrado =1
  var event = $('.chivato-evento').text();
  var code2 = $('#codigo').val();
  $.post( server +"validar.php", { code: code2 , event: event }, function( data ){
        console.log(data);
        $('#consola').html("<i class='fa fa-check icon-consola'></i> " + data + " - VÁLIDADO");
        $('footer').removeClass('footer-error').addClass('footer-ok');


    });
}
function devolucion(){
  // funcion que actualiza la bbdd a entrado =2
  var event = $('.chivato-evento').text();

  var code3 = $('#codigo').val();
  $.post( server +"devolucion.php", { code: code3 , event: event }, function( data ){
        console.log(data);
        $('#consola').html("<i class='fa fa-credit-card icon-consola'></i> " + data + " - DEVOLUCIÓN");
        $('footer').removeClass('footer-error').addClass('footer-warning');


    });
}

function mostrarEstadistica(){
  var event = $('.chivato-evento').text();
  $.post( server +"estadistica.php", { event: event }, function( data ){
        console.log(data);
        alert(data);

    });
}

function seleccionEvento(){
  $.post( server +"selectEvent.php", function( data ){
    $('#select').css('display', 'block').find('.ventana').html(data);

    $('#env-ev').click(function(){
      var event= $('.sel-ev').val();
      var eventArray = event.split("-");
      $('#select').css('display', 'none');
      $('.ventana_1').css('display', 'block');
      $('header').find('.nom-event').text(eventArray[1]);
      $('.chivato-evento').text(eventArray[0]);
      $('#estadistica').css('display', 'block');
    });

  });

}

$().ready(function(){
    //console.log("jquery ready");
    seleccionEvento();

    $( "#codigo" ).focus(function() {
        resetear();
    });

    $("#manual").click(function(){
        enviarCodigo();
    });
    $("#escanear").click(function(){
        escanear();

    });
    $("#validar").click(function(){
        validar();
        resetear();

    });
    $("#reset").click(function(){
        resetear();
    });
    $("#devolucion").click(function(){
        devolucion();
        resetear();
    });

    $("#reload").click(function(){
        location.reload();
    });
    $("#estadistica").click(function(){
      var evento = 110;
      mostrarEstadistica(evento);
    });



});
