
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API

      var pageTitle = document.title;
      mixpanel.track("PV: " + pageTitle);
      console.log('Start');
      
      // Get URL parametres
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('i');
      if (initial) {
        $("#ctaDiv").hide();
        $("#extraSection").hide();
        $("#questions").css("display", "flex");
      }
      var domain = params.get('d'); // "value1"
      var referrer = params.get('r'); // "value2"
      if (referrer) {
        referrer = 'rec' + referrer;
      }

      // API calls
      
      var webhook;
      let i = 0;
      var loadingIndex = 0;
      var x = "";
      let name = "";
      let companyName = "";
      let market = "";
      let product = "";
      let traction = "";
      let email = "";
      let contactId = "";
      let loadingInterval;
      let loadingWebsite = false;

      var loadingTexts = [    
        'Reading your website.','Reading your website..','Reading your website...',
        'Analysing it.', 'Analysing it..', 'Analysing it...',
        'Getting into the shoes of your customers.', 'Getting into the shoes of your customers..', 'Getting into the shoes of your customers...',
      ]


      // Reusable functions

      function startLoadingAnimation(elementId, loadingTexts) {
        return setInterval(function() {
            loadingIndex = (loadingIndex + 1) % loadingTexts.length;
            $("#" + elementId).text(loadingTexts[loadingIndex]);
        }, 1000);
      }

      function startLoadingBar(progressBar,fillerBar){
        $(progressBar).show();
        setTimeout(() => {
            $(fillerBar).css("width", "100%");
        }, 50);  // 50ms delay
      }





      // STEP 0: Subscribe to newsletter


      function subscribeToNewsletter() {
        i = 1;
        email = DOMPurify.sanitize($("#email").val().trim().toLowerCase());

        fbq('trackCustom', 'EmailSubscribe');
        
        // Check if email is ok
        if (email === '' || !email.includes('@') || !email.includes('.')) {
            $("#newsletterText").text('Please enter a valid email address');
            $("#newsletterText").css('color', '#DE3021');
            return;
        }

        // If successful
        $("#ctaDiv").hide();
        $("#extraSection").hide();
        $("#questions").css("display", "flex");

        // Make automation to signup email
        mixpanel.track('PMF Subscribe');
        var makehook = 'https://hook.us1.make.com/pmr4a5ihmurza3ggl84v2k6ndxp8kh74/?email=' + encodeURIComponent(email) + '&r=' + encodeURIComponent(referrer);
        fetch(makehook);
        /*var pipehook = 'https://eogogekomkr2wza.m.pipedream.net/?email=' + encodeURIComponent(email) + '&r=' + encodeURIComponent(referrer) + '&i=no';

        fetch(pipehook)
          .then(response => response.text()) // Use .json() if the response is in JSON format
          .then(data => {
              contactId = data;
              console.log(contactId);
          })
          .catch(error => {
              console.error('There was an error fetching the data:', error);
          });*/
      }

      // Click subscribe button
      $('#enter').click(function() {
        subscribeToNewsletter();
      });

      // Enter keyboard subscribe
      $('#email').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          subscribeToNewsletter();
        }
      });





      // STEP 1: Website

      function enterDomain() {

        i = 0;
        x = DOMPurify.sanitize($("#domain").val().trim());
        x = x.replace(/\s/g, ""); // remove spaces

        // Check if x is not empty
        if (x === '' || !x.includes('.')) {
            // *** change error message
            $("#errorMsg").text('Please enter a valid domain...');
            $("#errorMsg").show();
            console.log('URL is empty');
            return; // Exit the function early
        }
        $("#errorMsg").hide();

        // Cleaning input data
        if (!x.startsWith('http://') && !x.startsWith('https://')) { // If the input doesn't start with 'http://' or 'https://', add 'https://'
            x = 'https://' + x;
        }
        var matches = x.match(/https:\/\/[^/]+/); // Remove anything after '.com' or other domain extensions
        if (matches) {
            x = matches[0];
        }

        $("#q1").hide();
        $("#q2").show();
        $("#stepText").text("3 of 4");


        loadingWebsite = true;
        webhook = 'https://eoaf4fskxz4nzod.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=1' + '&email=' + encodeURIComponent(email);
        fetch(webhook)
          .then(response => response.json())
          .then(data => {
              loadingWebsite = false;

              $("#company").val(data.startupName);
              $("#product").val(data.product);
              $("#market").val(data.market);
              $("#traction").val(data.traction);

              if ($("#loadingDiv").is(":visible")) {
                $("#loadingDiv").hide();
                $("#q3").show();
              }
              

          })
          .catch(error => {
              console.error('There was an error fetching the data:', error);
          });

      }

      // Run on enter click
      $('#websiteBtn').click(function() {
        enterDomain();
      });

      // Run on enter keyboard
      $('#domain').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterDomain();
        }
      });

      $('#noWebsite').click(function() {
        $("#q1").hide();
        $("#q2").show();
        $("#stepText").text("3 of 4");
        $("#q2Heading").text("We'll get to what you do in just a second.");
        $("#q3Heading").text("Last few questions...");
      });



      // STEP 2: Name

      function enterName() {

        name = DOMPurify.sanitize($("#name").val().trim());

        // Check if x is not empty
        if (name === '') {
            $("#errorMsg").text('Please enter your name...');
            $("#errorMsg").show();
            console.log('Name is empty');
            return; // Exit the function early
        }
        $("#errorMsg").hide();

        $("#q2").hide();
        $("#stepText").text("4 of 4");

        if (loadingWebsite) {
          $("#loadingDiv").show(); // If still waiting for website info to be returned
          startLoadingBar('#progressBar','#filler'); // loading bar
          loadingInterval = startLoadingAnimation("loadingText",loadingTexts); // loading text
        } else {
          $("#q3").show();
        }

      }

      // Run on enter click
      $('#nameBtn').click(function() {
        enterName();
      });

      // Run on enter keyboard
      $('#name').keydown(function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
          enterName();
        }
      });



      // STEP 3: Save details

      $('#detailsBtn').click(function() {

        $("#errorMsg").hide();
        $('#detailsBtn').text('Loading...');
        try {
          companyName = DOMPurify.sanitize($("#company").val().trim());
          product = DOMPurify.sanitize($("#product").val().trim());
          market = DOMPurify.sanitize($("#market").val().trim());
          traction = DOMPurify.sanitize($("#traction").val().trim());
        } catch (error) {
          $("#errorMsg").text('Please complete the information first...');
          $("#errorMsg").show();
          $('#detailsBtn').text('Try again');
        }

        // *** if i = u then just adjust the success message, send make and dont do anything else

        // Check if x is not empty
        if (companyName != '' && product != '' && market != '' && traction != '') {

          var updatehook = 'https://hook.us1.make.com/qx2bees6cqp1ubqyx5k969bdjzyxtpbn/';

          var data = {
              email: email,
              x: x,
              name: name,
              startupName: companyName,
              product: product,
              market: market,
              traction: traction,
              i:initial,
          };

          fetch(updatehook, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
          })
          .then(response => response.json())
          .then(data => {
              console.log('Success:', data);
              $("#stepDiv").hide();
              $("#q3").hide();
              $("#success").show();
          })
          .catch((error) => {
              console.error('Error:', error);
              $("#errorMsg").text('Please try again...');
              $("#errorMsg").show();
              $('#detailsBtn').text('Try again');
          });

          
        } else {
          $("#errorMsg").text('Please answer each question...');
          $("#errorMsg").show();
        }
      });

  
    });
    
