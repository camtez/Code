
    var Webflow = Webflow || [];
    
    Webflow.push(function () {
      // DOMready has fired
      // May now use jQuery and Webflow API

      var pageTitle = document.title;
      mixpanel.track("PV: " + pageTitle);
      console.log('Start');
      
      
      // API calls
      
      let i = 0;
      let email = "";



      // STEP 0: Subscribe


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
        $("#enter").text("#success");

        // Make automation to signup email
        mixpanel.track('YBT Subscribe');
        var pipehook = 'https://eogogekomkr2wza.m.pipedream.net/?email=' + encodeURIComponent(email) + '&i=no';

        fetch(pipehook)
          .then(response => response.text()) // Use .json() if the response is in JSON format
          .then(data => {
              contactId = data;
              console.log(contactId);
          })
          .catch(error => {
              console.error('There was an error fetching the data:', error);
          });
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

  
    });
    
