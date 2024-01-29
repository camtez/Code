
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API

      var pageTitle = document.title;
      mixpanel.track("PV: " + pageTitle);
      
      // Get URL parametres
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('i');
      if (initial) {
        $("#ctaDiv").hide();
        $("#extraSection").hide();
        $("#questions").display("flex");
      }
      var domain = params.get('d'); // "value1"
      console.log(domain);
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
      let contactId = "";
      let loadingInterval;

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
        var email = DOMPurify.sanitize($("#email").val().trim());

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
        $("#questions").display("flex");

        // Make automation to signup email
        mixpanel.track('PMF Subscribe');
        var pipehook = 'https://eogogekomkr2wza.m.pipedream.net/?email=' + encodeURIComponent(email) + '&x=' + encodeURIComponent(x) + '&r=' + encodeURIComponent(referrer) + '&i=no';
        fetch(pipehook)
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
        startLoadingBar('#progressBar','#filler'); // loading bar
        loadingInterval = startLoadingAnimation("loadingText",loadingTexts); // loading text


        // *** PRELOAD THE SITE SUMMARY ASYNC in the background
        webhook = 'https://eon50fnxq1hplnj.m.pipedream.net/?x=' + encodeURIComponent(x) + '&i=no' + '&e=' + encodeURIComponent(exampleId);
        fetch(webhook);

        // *** After loading change to q3

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
            // *** change error message
            $("#errorMsg").text('Please enter your name...');
            $("#errorMsg").show();
            console.log('Name is empty');
            return; // Exit the function early
        }
        $("#errorMsg").hide();

        $("#q2").hide();
        $("#stepText").text("4 of 4");


        // *** IF still loading
        $("#loadingDiv").show();
        // *** ELSE
        $("#q3").show();
        // change text for website

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

        companyName = DOMPurify.sanitize($("#company").val().trim());
        product = DOMPurify.sanitize($("#product").val().trim());
        market = DOMPurify.sanitize($("#market").val().trim());
        traction = DOMPurify.sanitize($("#traction").val().trim());


        // Check if x is not empty
        if (companyName != '' && product != '' && market != '' && traction != '') {
          // *** send an email with today's tip (brevo)
          $("#stepText").hide();
        } else {
          $("#errorMsg").text('Please answer each question...');
          $("#errorMsg").show();
        }
      });

  
    });
    
