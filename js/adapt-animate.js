define([
  'core/js/adapt',
], function (Adapt) {

  Adapt.animate = _.extend({

    initialize: function () {
      this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
    },

    onAppDataReady: function () {
      this.listenTo(Adapt.config, 'change:_activeLanguage', this.onLangChange);
      if (!Adapt.course.get('_meLearning21') || !Adapt.course.get('_meLearning21')._animate) return;

      if (Adapt.course.get('_meLearning21')._animate._isEnabled) {
        this.setupAnimate();
        this.setupListeners();
      }
    },

    onLangChange: function () {
      this.removeListeners();
      this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
    },

    setupListeners: function () {
      this.listenTo(Adapt, {
        'popup:opened': this.notifyOpened,
        'popup:closed': this.notifyClosed
      });
    },

    removeListeners: function () {
      this.stopListening(Adapt, {
        'popup:opened': this.notifyOpened,
        'popup:closed': this.notifyClosed
      });
      this.stopListening(Adapt.config, 'change:_activeLanguage', this.onLangChange);
    },

    notifyOpened: function () {
      Adapt.animate.notifyIsOpen = true;
    },

    notifyClosed: function () {
      Adapt.animate.notifyIsOpen = false;
    },

    setupAnimate: function () {
      Adapt.animate.notifyIsOpen = false;
    }

  }, Backbone.Events);

  Adapt.animate.initialize();

  return Adapt.animate;

});
