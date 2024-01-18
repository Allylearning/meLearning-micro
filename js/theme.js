define([
  "core/js/adapt",
  "./themePageView",
  "./themeArticleView",
  "./themeBlockView",
  "./themeComponentView",
  "./themeView",
  "core/js/a11y",
], function(Adapt, ThemePageView, ThemeArticleView, ThemeBlockView, ThemeComponentView, ThemeView, A11y) {

  function onDataReady() {
    $(document).addClass(Adapt.course.get("_courseStyle"));
  }

  function extendDrawer() {
    addCustomElements();
    $('.js-drawer-exit-btn').click(function() {
      var scormWrapper = require('extensions/adapt-contrib-spoor/js/scorm/wrapper');
      if (scormWrapper) {
        var scormWrapperInstance = scormWrapper.getInstance();
        if (scormWrapperInstance.lmsConnected && !scormWrapperInstance.finishCalled) {
          scormWrapperInstance.finish();
        }
      }
      top.window.close();
    });

    $('.drawer__tab').click(function() {
      const index = $('.drawer__tab').index(this);
      setDrawerTab(index);
    });
  }

  function hasScrolled() {
    $(window).off('scroll');
    $('.nav').addClass('has-scrolled');
  }

  function changePage() {
    // adds or removes tabindex for accessiblity purposes
    $(".nav__back-btn").attr("tabindex", (Adapt.location._contentType === 'page') ? 0 : -1);

    // removes the scroll used by PLP
    $(window).off('scroll');
  }

  function addScroll() {
    $('.nav').removeClass('has-scrolled');
    setTimeout(function() {
      $(window).one('scroll', function() {
        hasScrolled();
      });
    }, Adapt.config.get('_drawer')?._duration ?? 400);
  }

  function addCourseTitle(view) {
    if (!view) return;
    var model = view.model;
    model.set({
      "courseTitle": Adapt.course.get('title')
    });
  }

  function onAudioElementRender(view) {
    var model = view.model;
    if (!model.get('_audio') || !model.get('_audio').mp3) return;
    var $view = $(view.$el);
    model.attributes._audio.audioSet = true;
    var itemName = '.' + model.get('_type') + '__header';
    $($view).on('click', itemName + ' .audio-controls .icon', function(event) {
      audioButtonClick(event);
    });
  }

  function drawerClosed() {
    $('.drawer__tab').removeClass('is-selected');
    $('.drawer__tab').first().addClass('is-selected');
  }

  function setDrawerTab(index) {
    const tabs = $('.drawer__tab');
    _.each(tabs, function(tab) {
      if ($(tab).index() === index) {
        $(tab).addClass('is-selected');
        if (index === 0) {
          $('.pagelevelprogress__nav-btn').click();
        } else if (index === 1) {
          Adapt.trigger('resources:showResources');
        } else if (index === 2) {
          Adapt.trigger('glossary:showGlossary');
        }
      } else {
        $(tab).removeClass('is-selected');
      }   
    });
    setTimeout(function() {
      A11y.focusFirst($('.drawer__item-btn').first(), { defer: true });
    }, Adapt.config.get('_drawer')?._duration ?? 400);
  }

  function audioButtonClick(event) {
    if (event) event.preventDefault();
    Adapt.trigger('audio', event.currentTarget);
  }

  function onPostRender(view) {
    var model = view.model;
    var theme = model.get("_meLearning21");

    if (!theme) return;

    switch (model.get("_type")) {
      case "page":
        new ThemePageView({
          model: new Backbone.Model(theme),
          el: view.$el
        });
        break;
      case "article":
        new ThemeArticleView({
          model: new Backbone.Model(theme),
          el: view.$el
        });
        break;
      case "block":
        new ThemeBlockView({
          model: new Backbone.Model(theme),
          el: view.$el
        });
        break;
      case "component":
        theme._isComplete = model.get("_isComplete");
        new ThemeComponentView({
          model: new Backbone.Model(theme),
          el: view.$el
        });
        break;
      default:
        new ThemeView({
          model: new Backbone.Model(theme),
          el: view.$el
        });
    }
  }

  function addCustomElements() {
    addComanyLogo();
    addCourseTitle();
  }

  function changeFeedbackTitle(view, alertObject) {
   if (view.model.get('_classes').includes("nofeedback")) {
      $('.notify__title-inner').text('Thank you for answering.');
    } else if(view.model.get('_isCorrect')) {
      $('.notify__title-inner').text('That’s right!');
    } else {
      $('.notify__title-inner').text('Not quite right');
    }
  }

  function addComanyLogo() {
    var logo = (Adapt.course.get('_meLearning21') && Adapt.course.get('_meLearning21')._companyLogo) ? Adapt.course.get('_meLearning21')._companyLogo : "assets/melearning-logo.svg";
    $('.company-logo').css('background-image', 'url(' + logo + ')');
  }

  Adapt.once({
    "menuView:preRender": addCustomElements,
    "pageView:preRender": extendDrawer
  });

  Adapt.on({
    "app:dataReady": onDataReady,
    "pageView:postRender articleView:postRender blockView:postRender componentView:postRender": onPostRender,
    "pageView:ready menuView:ready": addScroll,
    "router:location": changePage,
    "pageView:preRender": onAudioElementRender,
    "componentView:preRender": onAudioElementRender,
    "drawer:closed": drawerClosed,
    "tutor:opened": changeFeedbackTitle
  });
});
