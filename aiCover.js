
var Webflow = Webflow || [];

Webflow.push(function () {
  // DOMready has fired
  // May now use jQuery and Webflow API

  var pageTitle = document.title;
  mixpanel.track("PV: Cameron's Assistant");
  

  // Get URL parametres
  var params = new URLSearchParams(window.location.search);
  var jobUrl = params.get('analyse'); // "value1"
  console.log(jobUrl);
  
  
  // Variables
  var webhook;
  let i = 0;
  var loadingIndex = 0;
  let messageCount = 0;
  var x = "";
  let isFunctionRunning = false;
  const errorMessage = "Sorry, looks like something went wrong. Please refresh the page and try again.";
  let airtableId = "";
  let companyName = "";
  let companyType = "";
  let contactId = "";
  let loadingInterval;
  let lastIdeaText = "";
  let lastExampleText = "";
  let signupOption = 0;
  const loadingTexts1 = [
    'Reading your job post.','Reading your job post..','Reading your job post...',
    'Analyzing it.', 'Analyzing it..', 'Analyzing it...',
    'Summarizing your requirements.', 'Summarizing your requirements..', 'Summarizing your requirements...',
    'Scoring Cameron\'s fit.', 'Scoring Cameron\'s fit..', 'Scoring Cameron\'s fit...',
    'Proof reading.', 'Proof reading..', 'Proof reading...',
  ];
  const loadingTexts2 = [
    'Thinking.','Reading your job post..','Reading your job post...',
    'Checking Cameron\'s knowledge bank.', 'Analyzing it..', 'Analyzing it...',
    'Summarizing your requirements.', 'Summarizing your requirements..', 'Summarizing your requirements...',
    'Scoring Cameron\'s fit.', 'Scoring Cameron\'s fit..', 'Scoring Cameron\'s fit...',
    'Proof reading.', 'Proof reading..', 'Proof reading...',
  ];



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

  function getRandomIdeaText() {
    var randomExpression = ideaTexts[Math.floor(Math.random() * ideaTexts.length)];
    while (randomExpression === lastIdeaText) {
        randomExpression = ideaTexts[Math.floor(Math.random() * ideaTexts.length)];
    }
    lastIdeaText = randomExpression;
    return randomExpression;
  }

  function smoothScrollBy(distance, duration) {
    $('html, body').animate({
      scrollTop: $(window).scrollTop() + distance
    }, duration);
  }


  // STEP 1: Entering url

  function enterUrl() {

    if (isFunctionRunning) {
      console.log("Function is already running.");
      return;
    }

    i = 0;
    x = DOMPurify.sanitize($("#url").val().trim());
    x = x.replace(/\s/g, ""); // remove spaces

    // Check if x is not empty
    if (x === '' || !x.includes('.')) {
        console.log('URL is empty');
        return; // Exit the function early
    }
    isFunctionRunning = true;

    // Changes to UI
    $("#userInput1").hide();
    $("#userMessage1").css("display", "flex");
    $("#userText1").text(x);
    $("#assistantDiv1").css("display", "flex");
    startLoadingBar('#progressBar1','#filler1'); // loading bar
    loadingInterval = startLoadingAnimation("assistantText1",loadingTexts1); // loading text
    smoothScrollBy(100, 1000);


    // Cleaning input data
    if (!x.startsWith('http://') && !x.startsWith('https://')) { // If the input doesn't start with 'http://' or 'https://', add 'https://'
        x = 'https://' + x;
    }


    webhook = 'https://eo27heg805bqs9f.m.pipedream.net/?code=17jnw5dgs83&type=scan&url=' + encodeURIComponent(x);
    fetch(webhook)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        clearInterval(loadingInterval); // Stop loading message
        $("#progressBar1").hide();

        airtableId = data.id; // Save airtable id for future calls

        companyName = data.companyName;
        companyType = data.companyType;
        $("#companyName").text(companyName);
        $("#assistantHeading1").show();
        $("#assistantText1").html(data.text);
        $("#suggestionBtn1").text("What experience does Cameron have in " + companyType + "?");

        smoothScrollBy(100, 1000);

        setTimeout(() => { // Show NEXT
          $("#assistantDivPrompt").css("display", "flex");
          $("#userInputChat").css("display", "flex");
          smoothScrollBy(60, 1000);
          isFunctionRunning = false;
        }, 5000);

      })
      .catch(error => {
        clearInterval(loadingInterval); // Stop loading message
        console.log(error);
        $("#assistantText1").text('Something went wrong. Looks like I can\'t access that url. Refresh page to try again.');
        isFunctionRunning = false;
      });
  }
  
  // Run with jobUrl url parameter
  if (jobUrl) {
    $("#url").val(jobUrl);
    $("#urlEnter").click();
    console.log('triggered');
    enterUrl();
    mixpanel.track('Triggered via url param');
  }

  // Run on enter click
  $('#urlEnter').click(function() {
    enterUrl();
    mixpanel.track('Enter Click');
  });

  // Run on enter keyboard
  $('#url').keydown(function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      enterUrl();
      mixpanel.track('Enter Keyboard');
    }
  });



  // STEP 2: Chat
  function chatMessage(message) {
    
    if (isFunctionRunning) {
      console.log("Function is already running.");
      return;
    }

    // Check if message contains 'no more questions'
    if (message.toLowercase().includes('no more questions')) {
      $("#userInputChat").hide();
      return;
    }

    isFunctionRunning = true;

    // Changes to UI
    $("#userInputChat").hide();
    $("#chatContainer").css("display", "flex");

    // Create new user and assistant messages
    messageCount++; // Increment message count to ensure unique ID

    const templateUser = document.getElementById("userMessageChat");
    const templateAssistant = document.getElementById("assistantDivChat");
    const cloneUser = templateUser.cloneNode(true); // Deep clone the template
    const cloneAssistant = templateAssistant.cloneNode(true);

    cloneUser.id = `userMessageChat-${messageCount}`; // Update ID of cloned element
    cloneAssistant.id = `assistantDivChat-${messageCount}`;

    // Update the ID of internal elements like the paragraph containing the message
    const userTextTemp = cloneUser.querySelector("#userTextChat");
    userTextTemp.id = `userTextChat-${messageCount}`;
    userTextTemp.textContent = message;

    const assistantTextTemp = cloneAssistant.querySelector("#assistantTextChat");
    assistantTextTemp.id = `assistantTextChat-${messageCount}`;

    const progressBarTemp = cloneAssistant.querySelector("#progressBarChat");
    progressBarTemp.id = `progressBarChat-${messageCount}`;

    const progressFillerTemp = cloneAssistant.querySelector("#fillerChat");
    progressFillerTemp.id = `fillerChat-${messageCount}`;

    // Append the cloned element to the chat container
    document.getElementById("chatContainer").appendChild(cloneUser);
    document.getElementById("chatContainer").appendChild(cloneAssistant);

    // Show the elements once ready
    $(`#userMessageChat-${messageCount}`).css("display", "flex"); // Show
    $(`#assistantDivChat-${messageCount}`).css("display", "flex");


    smoothScrollBy(100, 1000);

    // loading animation
    startLoadingBar(`#progressBarChat-${messageCount}`,`#fillerChat-${messageCount}`);
    loadingInterval = startLoadingAnimation(`assistantTextChat-${messageCount}`, loadingTexts2);
        

    webhook = 'https://eo27heg805bqs9f.m.pipedream.net/?code=17jnw5dgs83&type=chat&id=' + encodeURIComponent(airtableId) + '&message=' + encodeURIComponent(message);
    fetch(webhook)
    .then(response => response.json())
    .then(data => {
      clearInterval(loadingInterval); // Stop loading message
      $(`#progressBarChat-${messageCount}`).hide();
      $(`#assistantTextChat-${messageCount}`).html(data.text);

      smoothScrollBy(100, 1000); 
      isFunctionRunning = false;

      setTimeout(() => { // Show input again
        $("#userInputChat").css("display", "flex");
        smoothScrollBy(60, 1000);
      }, 5000);

    })
    .catch(error => {
      clearInterval(loadingInterval);
      $(`#progressBarChat-${messageCount}`).hide();
      $(`#assistantTextChat-${messageCount}`).text('Something went wrong sorry. Please try again.');
      isFunctionRunning = false;
      $("#userInputChat").css("display", "flex");
    });

  }

  
  $('#suggestionBtn1').click(function() {
    chatMessage($('#suggestionBtn1').text());
    mixpanel.track('Suggestion Btn 1');
  });

  $('#suggestionBtn2').click(function() {
    chatMessage($('#suggestionBtn2').text());
    mixpanel.track('Suggestion Btn 2');
  });

  $('#suggestionBtn3').click(function() { // No more questions -> go to feedback
    mixpanel.track('Suggestion Btn 3');
    $("#userInputChat").hide();
    $("#userMessageDone").css("display", "flex");
    $("#assistantDivFeedback1").css("display", "flex");
    $("#userInputFeedback1").css("display", "flex");
  });

  $('#messageEnter').click(function() {
    chatMessage(DOMPurify.sanitize($("#message").val().trim()));
    mixpanel.track('Enter Message Click');
  });
  $('#message').keydown(function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      chatMessage(DOMPurify.sanitize($("#message").val().trim()));
      mixpanel.track('Enter Message Keyboard');
    }
  });








  // STEP 3: gather feedback

  $('#feedbackBtn1').click(function() {
    mixpanel.track('Feedback Btn - Awesome');
    $("#userInputFeedback1").hide();

    $("#userTextFeedback1").text($("#feedbackBtn1").text());
    $("#userMessageFeedback1").css("display", "flex");

    // Skip to CTA (not asking for more feedback)
    $("#assistantDivCta").css("display", "flex");
    $("#userInputCta").css("display", "flex");
  });

  $('#feedbackBtn2').click(function() {
    mixpanel.track('Feedback Btn - Meh');
    $("#userInputFeedback1").hide();

    $("#userTextFeedback1").text($("#feedbackBtn2").text());
    $("#userMessageFeedback1").css("display", "flex");
    $("#assistantDivFeedback2").css("display", "flex");
    $("#userInputFeedback2").css("display", "flex");
  });
  
  $('#feedbackBtn3').click(function() {
    mixpanel.track('Feedback Btn - Not great');
    $("#userInputFeedback1").hide();

    $("#userTextFeedback1").text($("#feedbackBtn3").text());
    $("#userMessageFeedback1").css("display", "flex");
    $("#assistantDivFeedback2").css("display", "flex");
    $("#userInputFeedback2").css("display", "flex");
  });


  function saveFeedback(feedback) {

    // Check if feedback is not empty
    if (feedback === '' || !feedback) {
      console.log('Feedback is empty');
      return; // Exit the function early
    }

    $("#userInputFeedback2").hide();
    $("#userTextFeedback2").text($("#feedback").val());
    $("#userMessageFeedback2").css("display", "flex");
    $("#assistantDivCta").css("display", "flex");
    $("#userInputCta").css("display", "flex");

    // Save to airtable
    webhook = 'https://eo27heg805bqs9f.m.pipedream.net/?code=17jnw5dgs83&type=feedback&id=' + encodeURIComponent(airtableId) + '&message=' + encodeURIComponent(feedback) + '&btn='+ encodeURIComponent($("#userTextFeedback1").text());
    fetch(webhook); // No need to do anything with response

  }

  $('#feedbackEnter').click(function() {
    saveFeedback(DOMPurify.sanitize($("#feedback").val().trim()));
    mixpanel.track('Enter Feedback Click');
  });
  $('#feedback').keydown(function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      saveFeedback(DOMPurify.sanitize($("#feedback").val().trim()));
      mixpanel.track('Enter Feedback Keyboard');
    }
  });




  // STEP 4: final CTA tracking + redirects
  $('#cta1').click(function() {
    mixpanel.track('CTA Calendly Click');
  });
  $('#cta2').click(function() {
    mixpanel.track('CTA More Info Click');
  });

  $('#cta3').click(function() { // Reload feedback if hasn't already been used
    mixpanel.track('CTA Not Interested Click');
    if ($('#feedback').text) {
      $("#userInputCta").hide();
      $("#assistantDivThanks").css("display", "flex");
    } else {
      // *** how to load the feedback below where it was before??
    }
  });


  

  
});
    
