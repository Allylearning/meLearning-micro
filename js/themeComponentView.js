define([
  "./themeView",
  "core/js/adapt"
], function(ThemeView, Adapt) {

  var ThemeComponentView = ThemeView.extend({

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.removeInViewListeners);

      if(this.checkIsDisabled()) return;
      this.setAnimation();
      this.setAnimationOnQuestions();
    },

    checkIsDisabled: function() {
      // check extension enabled on course and component level and don't show if component is complete
      if(!Adapt.course.get('_meLearning21')._animate || !Adapt.course.get('_meLearning21')._animate._isEnabled || !this.model.get('_animate') || !this.model.get('_animate')._isEnabled || this.model.get('_isComplete')) {
        return true;
      }
      return false;
    },

    setAnimationOnQuestions: function() {
      if($(this.$el).hasClass('is-question')) {
        let $items = this.findQuestionItems();
        _.each($items, function($item) {  
          $($item).addClass('is-animate-hidden').addClass('is-animated');
        });
      }
    },

    setAnimation: function() {
      $(this.$el).addClass('is-animated').addClass('is-animate-hidden');
      $(this.$el).on('inview', _.bind(this.inview, this));
    },

    inview: function (event, visible, visiblePartX, visiblePartY) {
      if (visible) {
        if (visiblePartY === 'top') {
          this._isVisibleTop = true;
        } else if (visiblePartY === 'bottom') {
          this._isVisibleBottom = true;
        } else {
          this._isVisibleTop = true;
          this._isVisibleBottom = true;
        }

        // Check if element comes into view
        if ((this._isVisibleTop || this._isVisibleBottom) && !Adapt.animate.notifyIsOpen) {
          this.animateComponent();
          this.removeInViewListeners();
        }
      }
    },

    removeInViewListeners: function () {
      $(this.$el).off('inview');
    },

    animateQuestions: function ($items, animationType, animatonLength) {
      _.each($items, function($item, index) {
        _.delay(function () {
          $($item).removeClass('is-animate-hidden').addClass('fadeInLeft');
        }.bind(this), animatonLength + (animatonLength * (index + 1)));
      });
    },

    findQuestionItems: function() {
      let $items = [];
      let index = 0;

      while (index > -1) {
        let $item = $(this.$el).find('.item-' + index);
        if($item.length <= 0) {
          index = -1;
        } else {
          $items.push($item[0]);
          index++;
        }
      }
      return $items;
    },

    animateComponent: function() {
      let context = this;
      let animationType;
      let animatonLength = 250;
      let className = $(this.$el).attr('class');
      if(className.includes("is-left")) animationType = 'fadeInLeft';
      if(className.includes("is-right")) animationType = 'fadeInRight';
      if(className.includes("is-full")) animationType = 'fadeInUp';
      $(this.$el).addClass(animationType);
      let $items = this.findQuestionItems();
      _.delay(function () {
        $(this.$el).removeClass('is-animate-hidden'); 
      }.bind(this), animatonLength);
      if(!$items) return;
      context.animateQuestions($items, animationType, animatonLength);
    }
  });

  return ThemeComponentView;

});
