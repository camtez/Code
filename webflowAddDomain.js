
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API

      // Get URL parametres
      var params = new URLSearchParams(window.location.search);
      var email = params.get('e'); // "value1"
      console.log(email);

      if (email) { 
        $("#defaultDiv").hide();
        $("#emailDiv").css("display", "flex");
        $("#emailText").val('Your email is ' + email);
      }




      
      // API calls
      
      var webhook;
      let i = 0;
      var loadingIndex = 0;
      var x = "";
      const errorMessage = "There's been a hiccup. Let's make it work this time.";
      let id = "";
      let companyName = "";
      let contactId = "";
      let loadingInterval;
      const savingText = ["Saving...","Saving.","Saving.."];


      // Reusable functions

      function startLoadingAnimation(elementId, loadingTexts) {
        return setInterval(function() {
            loadingIndex = (loadingIndex + 1) % loadingTexts.length;
            $("#" + elementId).text(loadingTexts[loadingIndex]);
        }, 1000);
      }
    
      // STEP 1: Entering domain -> message0

      let isFunctionRunning = false;

      function enterDomain() {

        console.log('clicked');
        if (isFunctionRunning) {
          console.log("Function is already running.");
          return;
        }
        isFunctionRunning = true;

        i = 0;
        x = DOMPurify.sanitize($("#domain").val().trim());
        console.log(x);

        // Start the interval to cycle through the loading texts
        loadingInterval = startLoadingAnimation("enter",savingText);
        $("#errorMessage").hide();

        // Check if x is not empty
        if (x === '') {
            $("#errorMessage").text('Please enter a domain');
            $("#errorMessage").show();
            console.log('URL is empty')
            return; // Exit the function early
        }
    
        // Preparing data
        if (!x.startsWith('http://') && !x.startsWith('https://')) { // If the input doesn't start with 'http://' or 'https://', add 'https://'
            x = 'https://' + x;
        }
        /*var matches = x.match(/https:\/\/[^/]+/); // Remove anything after '.com' or other domain extensions
        if (matches) {
            x = matches[0];
        }*/

        // Pipedream Submit Domain
        webhook = 'https://eouv4h921hkuwbt.m.pipedream.net/?x=' + encodeURIComponent(x) + '&e=' + encodeURIComponent(email);
        fetch(webhook)
            .then(response => response.json())
            .then(data => {
              clearInterval(loadingInterval); // Stop loading message
              $("#inputElement").hide();
              $("#successElement").css("display", "flex");
              
            })
            .catch(error => {
              clearInterval(loadingInterval); // Stop loading message
              console.log(error);
              $("#errorMessage").text("Something went wrong. Please try again or send me an email.");
              $("#errorMessage").show();
              $("#enter").text("Try Again");
              isFunctionRunning = false;
            });
      }

      $('#enter').click(function() {
        enterDomain();
      });

      $('#domain').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterDomain();
        }
      });

    });
    