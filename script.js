(function($){

    var layeranimation = function(rootNode) {
        var self = this;

        this.scrollTime = 500;
        this.waitTime = 4000;
        this.stepWidth = 20;
        this.nextItemIntverall = 0.7;
        this.zIndex = 100;
        this.offsetWidth = 0;
        this.isPlaying = true;
        this.itemButtonClicked = false;
        this.layerPlayingTimeOut = null;

        this.root = rootNode;
        rootNode[0].layerAnimation = self;

        this.layerList = null;
        this.layer = new Array();
        this.currentLayer = 1;
        this.currentItem = 0;
        this.isRunning = false;

        this.run = function(itemNrNew, layerNew) {

            // Set Current Item
            var itemNr = self.currentItem;
            if ( typeof itemNrNew == 'number' ) itemNr = itemNrNew;

            // Set Current Layer
            var layerNr = self.currentLayer;
            if ( typeof layerNew == 'number' ) layerNr = layerNew;

            // If it does not exist, return
            if ( !self.layer[layerNr] || !self.layer[layerNr].items[itemNr] ) { self.isRunning = false; return; }

            self.isRunning = true;

            // Get the Item
            var item =  self.layer[layerNr].items[itemNr];
            if ( itemNr == 0 && self.isPlaying ) {
                self.setActive(self.layerList.children().get(layerNr), true, false);
            }

            // Calc Position + Timeout Step
            var currentLeft = parseInt(item.elem.css('left'));

            var timeout = item.currentTime / (currentLeft * item.direction) * self.stepWidth;

            if ( itemNr == 0 && currentLeft == self.offsetWidth * item.direction ) {
                var number = layerNr-1 < 0 ? self.layer.length-1 : layerNr-1;
                self.layer[number].elem.filter(':not(:animated)').css('opacity', 0)/*fadeTo(self.scrollTime, 0, function(){
                        self.layer[number].elem.css('z-index', self.zIndex);
                        console.log("animation done " + itemNr + " " + number);
                })*/;
            }

            currentLeft -=  (self.stepWidth * item.direction);
            if ( ( currentLeft <= 0 && item.direction > 0 ) || ( currentLeft >= 0 && item.direction < 0 ) ) { currentLeft = 0; }

            // Set new Position and Timeout
            item.elem.css('left', currentLeft);
            if ( itemNr == 0 ) {
                self.layer[layerNr].elem.css('left', currentLeft);
            }

            // Start next Item in Layer after Intervall
            if ( item.currentTime <= (self.scrollTime * self.nextItemIntverall) ) {
                window.setTimeout( function() { self.run(itemNr +1, layerNr); }, timeout);

                // Reset previous if next Layer comes
    //            if ( this.layer.length > 1 && firstStep)
    //                this.resetLayer(layerNr -1 );
                self.layer[layerNr].elem.css('z-index', self.zIndex);
            }

            item.currentTime -= timeout;

            // If this is not the current layer, but an intervalled layer, return
            if ( itemNrNew || layerNew ) { return; }

            // scrolling done ?
            if ( itemNr == self.currentItem && (( currentLeft <= 0 && item.direction > 0 ) || ( currentLeft >= 0 && item.direction < 0 )) ) {

                if ( self.currentItem < self.layer[layerNr].items.length -1 ) {

                    self.currentItem++;

                } else {

                    if ( self.layer.length > 1 )
                        self.resetLayer(layerNr -1 );
                    self.layer[layerNr].elem.css('z-index', self.zIndex);

                    if ( layerNr < self.layer.length-1 ) {
                        self.currentLayer++;                
                    } else {
                        self.currentLayer = 0;
                    }

                    self.currentItem = 0;
                    timeout = self.layer[layerNr].waitTime || self.waitTime;

                    $(document).trigger("layeranimation.layerDone", self.layer);

                    if ( ! self.isPlaying || self.layer.length == 1 ) {
                        self.isRunning = false;
                        return;
                    }
                }
            }

            // next run routine;
            self.layerPlayingTimeOut = window.setTimeout( self.run, timeout);
        };

        this.resetLayer = function(layer, alsoCurrent) {

            if ( layer < 0 ) { layer = self.layer.length-1; }
            if ( !self.layer[layer] ) { return; }

            var currentLayer = alsoCurrent ? ( self.currentLayer-1 < 0 ? self.layer.length-1 : self.currentLayer-1 ) : self.currentLayer;
            var offset = layer == currentLayer ? 0 : self.offsetWidth;

            $(self.layer[layer].items).each(function(){
                this.elem.css({'left': this.direction * offset});
                this.currentTime = self.scrollTime;
            });

            // Special for layer one
            self.layer[layer].elem.css({
                                        'z-index': self.zIndex +100,
                                        'left' : self.layer[layer].items[0].direction * offset
                                        }).fadeTo(0, 1);
        };

        /* *****************************************************************************

            Build Structure

        ***************************************************************************** */

        this.layerStruct = function() {
            this.items = new Array();
            this.elem = null;
            this.waitTime = self.waitTime;
        };

        this.itemStruct = function() {
            this.elem = null;
            this.direction = +1;
            this.currentTime = 0;
            this.next = null;
        };

        this.layerClick = function(elem) {

            this.Toggle = function(e) {

                this.elem = $(this);
                if (e.target) this.elem = $(e.target);
                else if (e.srcElement) this.elem = $(e.srcElement);

                this.isPlayPause = this.elem.hasClass('play-pause');
                this.active = !this.elem.hasClass('active');

                this.playPauseToggle = function(e) {
                    if ( this.active ) {
                        // pause playing
                        self.Pause();
                        self.itemButtonClicked = true;
                    } else {
                        // start playing
                        self.itemButtonClicked = false;
                        self.Resume();
                    }
                };

                this.layerToggle = function(e) {
                    self.setActive( this.elem, this.active, this.isPlayPause);
                    if ( this.active ) {

                        if ( self.layer.length == 1 ) return;
                        // stop all animation
                        self.Pause();
                        var resetLayer = self.currentLayer-1;
                        if ( self.isRunning ) {
                            window.clearTimeout(self.layerPlayingTimeOut);
                            self.resetLayer(self.currentLayer);
                        }

    //                    self.layer[self.currentLayer].elem.style.zIndex = self.zIndex;
    //                    var resetLayer = self.currentLayer-1;
                        if ( resetLayer < 0 ) resetLayer = self.layer.length -1;

                        // reset Layer for position calculation
                        self.currentItem = 0;

                        // get current Position
                        self.currentLayer = this.elem.parent().children().index(this.elem);

                        // Set Playmode to pause
                        self.setActive( this.elem.parent().children().last(), true, true );

                        // Reset Layers manually to 0px
                        // Set zIndex and reset previous entry
                        self.layer[self.currentLayer].elem.css({'z-index': self.zIndex, 'left':0});
                        self.layer[self.currentLayer].elem.children().css('left', 0);

                        var timeout = self.layer[self.currentLayer].waitTime;

                        self.resetLayer(self.currentLayer-1);
                        if ( resetLayer != self.currentLayer ) self.resetLayer(resetLayer);

                        // prepare next Layer for animation
                        if ( self.currentLayer < self.layer.length-1 ) {
                            self.currentLayer++;                
                        } else {
                            self.currentLayer = 0;
                        }

                        // disable hover re-enable function
                        self.itemButtonClicked = true;
                        window.setTimeout(function() {
                            // start playing
                            self.Resume();
                        }, timeout);

                        $(document).trigger("layeranimation.layerDone", self.layer);
                    } else {

                        // start playing
                        self.itemButtonClicked = false;
                        self.Resume();
                    }
                };

                return this.isPlayPause ? this.playPauseToggle() : this.layerToggle();
            };

            elem.click(this.Toggle);
        };

        this.setActive = function(elem, active, isPlayPause) {

            elem = $(elem);

            // Reset "active" on each
            if ( !isPlayPause ) {
                elem.parent().children().removeClass('active');
            }

            // set "active" on current
            if ( active ) {
                elem.addClass('active');
            } else if ( isPlayPause ) {
                elem.removeClass('active');
            }
        };

        // Pause all animation if still playing
        this.Pause = function() {

            if ( ! self.isPlaying ) return;
            if ( self.itemButtonClicked ) return;

            self.isPlaying = false;
            if ( !self.isRunning ) window.clearTimeout(self.layerPlayingTimeOut);
            self.setActive( self.layerList.children().last(), true, true );
        };

        // resume animation if not playing
        this.Resume = function() {

            if ( self.isPlaying ) return;
            if ( self.itemButtonClicked ) return;
            if ( self.layer.length == 1 ) return;

            self.setActive( self.layerList.children().last(), false, true );
            self.isPlaying = true;
            if ( !self.isRunning ) self.layerPlayingTimeOut = window.setTimeout( self.run, 2000);
        };

        this.togglePlayState = function( active ) {
            if ( active ) {
                self.itemButtonClicked = false;
                self.Resume();
            } else {
                self.Pause();
                // do not re-enable automatically
                self.itemButtonClicked = true;
            }
        };

        this.init = function() {

            if ( !self.root || (document.documentMode && document.documentMode < 8) || self.root.find('div[type=layer]').length < 1)
            {
              return;
            }

            self.layerList = $('<ul/>').addClass('layeranimation_layer').css('display', 'inline-block').appendTo(self.root);
            self.root.removeClass('noscripting').addClass('scripting');

            // make clean
            self.layer = new Array();

            // Each Layer
            self.root.find('div[type=layer]').each(function()
            {
                var innerLayer = new self.layerStruct();
                innerLayer.elem = $(this);
                innerLayer.waitTime = innerLayer.elem.attr('timing') * 1000 || self.timeout;
                innerLayer.elem.show().css({
                                        'z-index': self.zIndex + 100,
                                        transitionDuration: (self.scrollTime / 1000 * 2) + 's'
                                    });

                if ( self.offsetWidth == 0 ) {
                    self.offsetWidth = innerLayer.elem.width(); // Offset from the first layer.
                }

                if ( self.layer.length <= 1 && innerLayer.elem.hasClass('fixed') ) {
                    innerLayer.elem.css('z-index', 100);
                } else {
                    innerLayer.elem.bind('mouseover', self.Pause);
                    innerLayer.elem.bind('mouseout', self.Resume);

                    self.layer.push(innerLayer);

                    var layerListItem = $('<li/>').text(self.layer.length).attr('title', 'skip to layer ' + self.layer.length).addClass(self.layer.length <= 1 ? 'active' : '');

                    new self.layerClick(layerListItem);
                    self.layerList.append(layerListItem);
                    self.layerList.width(self.layerList.width() + layerListItem.width() * 1.3);
                }

                innerLayer.elem.find('div.item').each(function(){

                    var innerItem = new self.itemStruct();
                    innerItem.elem = $(this);
                    innerItem.direction = innerItem.elem.hasClass('right') ? -1 : 1;
                    innerItem.currentTime = self.scrollTime;

                    if ( self.layer.length <= 1 || innerLayer.elem.hasClass('fixed') ) {
                        innerItem.elem.css('left', 0);
                    } else {
                        innerItem.elem.css('left', innerItem.direction * self.offsetWidth);
                        if ( innerLayer.items.length < 1 && !innerItem.elem.hasClass('first') ) { 
                            innerLayer.elem.css('left', innerItem.direction * self.offsetWidth);
                        }
                    }

                    if ( innerLayer.items.length < 1 && !innerItem.elem.hasClass('first') ) { 
                        innerItem.elem.addClass('first');
                    }

                    innerLayer.items.push(innerItem);
                    innerItem.elem.find('img').on('load', function(e) {
                        e.currentTarget.loaded = true;
                    });
                });
            });

            var layerListItem = $('<li/>').addClass('play-pause').attr('title', 'pause animation').appendTo(self.layerList);
            self.layerList.width(self.layerList.width() + layerListItem.width());
            self.layerList.css('display', ''); // This is not hide, it is remove inline-block from above
            new self.layerClick(layerListItem, self);

            this.layerPlayingTimeOut = window.setTimeout( self.run, self.layer[0].waitTime);

            // Check if layeranimation is in viewport
            var animationHeight = self.root.height();
            var originalAnimationTop = self.root.offset().top;
            var onScroolResize = function() {

                var scrollTop = $(window).scrollTop();
                var windowHeight = $(window).height();

                if ( (scrollTop >= originalAnimationTop+animationHeight || scrollTop+windowHeight <= originalAnimationTop ) && self.isPlaying )
                {
                    // stopPlaying
                    self.Pause();
                }
                else if ( (scrollTop < originalAnimationTop+animationHeight && scrollTop+windowHeight > originalAnimationTop ) && !self.isPlaying  )
                {
                    self.Resume();
                }
            };

            $(document).bind('scroll resize touchmove touchend', onScroolResize);
        };

        this.toggleCSSSaveState = function( $elem, save ) {
            // Stow away or get the current css

            var currentStyle = (save?'':'save-') + 'style';
            var saveStyle = (!save?'':'save-') + 'style';

            $elem.attr(saveStyle, $elem.attr(currentStyle));
            $elem.attr(currentStyle, '');
        };

        this.prevWidth = null;
        this.resizeLayers = function() {

            // Only on changes of the width.
            var newWidth = this.root.width();
            if ( this.prevWidth == newWidth ) { return; }
            this.prevWidth = newWidth;

            // Each Layer
            $.each(self.layer, function(index)
            {
                var currentLayer = this;
                var setHeight = function() {
                    var layerHeight = 0;
                    $.each(currentLayer.items, function(){
                        layerHeight = Math.max( layerHeight, this.elem.height() );
                    });

                    currentLayer.elem.height(layerHeight);
                };

                var checkImageLoadedStatus = function() {
                    // check load status of images
                    var loaded = true;
                    $.each(currentLayer.items, function(){
                        this.elem.find('img').each(function(){
                            loaded = loaded && (this.loaded || self.IsImageOk(this));
                        });
                    });

                    if ( !loaded ) {
                        window.setTimeout( checkImageLoadedStatus, 100 );
                    } else {
                       setHeight(); 
                    }
                };

                checkImageLoadedStatus();
            });
        };

        this.IsImageOk = function(img) {
            // http://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-in-javascript
            // During the onload event, IE correctly identifies any images that
            // weren’t downloaded as not complete. Others should too. Gecko-based
            // browsers act like NS4 in that they report this incorrectly.
            if (!img.complete) {
                return false;
            }

            // However, they do have two very useful properties: naturalWidth and
            // naturalHeight. These give the true size of the image. If it failed
            // to load, either of these should be zero.

            if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0) {
                return false;
            }

            // No other way of checking: assume it’s ok.
            return true;
        };

        this.activationStatus = function(activate) {

            self.togglePlayState( activate );

            // Layer selection list
            self.layerList.toggle( activate );
            self.root.removeClass( (activate?'no':'') + 'scripting').addClass( (!activate?'no':'') + 'scripting');

            // Each Layer
            self.offsetWidth = activate ? 0 : self.offsetWidth;
            $(self.layer).each(function(index)
            {
                self.toggleCSSSaveState( this.elem, !activate );
                $(this.items).each(function(){
                    self.toggleCSSSaveState( this.elem, !activate );
                });

                if ( activate ) {
                    if ( self.offsetWidth == 0 ) {
                        self.offsetWidth = $(this.elem).width(); // Offset from the first layer.
                    }
                    self.resetLayer(index, true);
                }
            });

            self.resizeLayers();
        };
    };

    var initialize = function() {
        $('div.layeranimation').each(function(){
            (new layeranimation($(this))).init();
        }).on('layeranimation.activate', function(e, activate){
            this.layerAnimation.activationStatus(activate);
        }).on('layeranimation.resize', function(e, activate){
            this.layerAnimation.resizeLayers();
        });
    };

    // On load
    $(initialize);

})(jQuery);
