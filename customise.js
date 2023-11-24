var Webflow = Webflow || [];

Webflow.push(function () {
  // DOMready has fired
  // May now use jQuery and Webflow API
  
  var pageTitle = document.title;
  mixpanel.track("PV: " + pageTitle);

  let loadingInterval;
  const loadingText = ["Loading...","Loading.","Loading.."];

  function startLoadingAnimation(elementId, loadingTexts) {
    return setInterval(function() {
        loadingIndex = (loadingIndex + 1) % loadingTexts.length;
        $("#" + elementId).text(loadingTexts[loadingIndex]);
    }, 1000);
  }

  function updateInfo() {

    console.log('update');
    f = DOMPurify.sanitize($("#feedback").val().trim());

    // Check if id is empty
    if (id === '') {
        console.log('Error')
        return; // Exit the function early
    }

    // Pipedream Update
    webhook = 'https://eowhozbv1xq08jj.m.pipedream.net/?i=' + encodeURIComponent(id) + '&c=' + encodeURIComponent(clicked);
    fetch(webhook)
        .then(response => response.json())
        .then(data => {
          clearInterval(loadingInterval); // Stop loading message
          console.log(data);
          $("#copyNpasteTitle").show();
          $("#copyNpaste").html(data);
          if (f) {
            f = '';
            $("#feedback").text("");
            $("#enter").text("Thank you!!")
          }
          clicked = '';

        })
        .catch(error => {
          clearInterval(loadingInterval); // Stop loading message
          console.log(error);
          //$("#feedback").text("That didn't work. Please try again.");
        });

        clearInterval(loadingInterval);
    $("#inputElement").hide();
  	$("#successElement").css("display", "flex")
  }

  function toggleElements() {
    if (clicked == 'more') {
        $("#moreDiv").css("display", "flex");
        loadingInterval = startLoadingAnimation('copyNpaste',loadingText)
        updateInfo();
        clearInterval(loadingInterval);
      } else {
        $("#feedbackDiv").css("display", "flex");
        if (clicked == 'great') {
            $("#feedbackQuestion").text('Would you pay $20 per month to provide more information about your product and get more consistently higher-quality insights from AI Steve?');
        } else if (clicked == 'ok') {
            $("#feedbackQuestion").text('Who do you think benefits most from Conversion Examples? What could we do better?');
        } else if (clicked == 'bad') {
            $("#feedbackQuestion").text('What do you like most about the concept of Conversion Examples? Where are we missing the mark?');
        }
        updateInfo();
      }
  }
  
  
  // Get URL parametres
  var params = new URLSearchParams(window.location.search);
  var id = params.get('i');
  console.log(id);
  let clicked = params.get('c');
  console.log(clicked);

  // Toggle elements
  $("#defaultDiv").hide();
  toggleElements();

  $('#greatBtn').click(function() {
    clicked = 'great';
    updateInfo();
    toggleElements();
  });

  $('#okBtn').click(function() {
    clicked = 'ok';
    updateInfo();
    toggleElements();
  });

  $('#badBtn').click(function() {
    clicked = 'bad';
    updateInfo();
    toggleElements();
  });

  $('#shareBtn').click(function() {
    navigator.clipboard.writeText('Check this out: conversionexamples.com');
    $("#shareMsg").show();
    updateInfo();

  });


  $('#enter').click(function() {
    updateInfo();
    $("#enter").text("Sending...")
  });

  $('#feedback').keydown(function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      updateInfo();
      $("#enter").text("Sending...")
    }
  });
  

});