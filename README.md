#Layer Animation - animated DokuWiki content


The Layer Animation plugin displays your DokuWiki content in an animated series of layers. It supports the plugins you have installed in your DokuWiki. The series of layers has items inside - which are a kind of layers too - that float into the viewport one after the other. 

You can hover the animation with the mouse to pause it. Leaving the animated area will resume the anmation. You can also click the pause/play button at the lower left the pause and resume the current animation.

Pausing the animation causes the current layer to end its animation (if still in progress) and then stop until you resume it. The buttons always show the current state.

The lower left also shows a button for each layer. Clicking the button skips to the layer and pauses the animation. Clicking the button again will resume the animation after a timeout of two seconds.

##Syntax

```
<animation %HEIGHT% [%CLASS%]>
    <layer %OPTION% [%CLASS%]>
        <item %OPTION%[?%CLIP%]>
            This is all **DokuWiki [[Content]]**
            You can even use other plugins and images.
        </item>

        <item>
            ...
        </item>
    </layer>

    <layer>
        ...
    </layer>
</animation>
```

###Options


There are basically three things that can be defined using the options place holders ``%HEIGHT%``, ``%CLASS%``, ``%OPTION%`` and ``%CLIP%`` from above.

  * ``%HEIGHT%`` - is a number determining the height of the overall animation in pixels. The width of the animation cannot be set - it is always 100% of the available width. If you want that otherwise, you can define the following in your template stylesheet: ``#layeranimation {width: 50%;}``
  * ``%CLASS%`` (optional) - the name of a class in your template
  * ``%OPTION%`` - there is one special keyword you can use here (see below). Besides the keyword you can put any CSS class name into this place to make the animation look more like you need it (e.g. colors, floating of images, text direction ... )
    * Keyword **fixed** in **layer** - this can only be used in the first layer and will make it a static background layer.
    * Keyword **right** in **item** - using this keyword in an item will animate it from left to right instead of right to left.
  * ``%CLIP%`` (optional) - if you use several items with links in the same layer, you will not be able to click the links on the lower items. This is due to HTML Container positioned above. Using the optional clipping you can set the viewport of an item (the CSS attribute "clip" will be used). You have to define four values  - numbers or "auto" - for ``top,right,bottom,left``, e.g: <item ?auto,100,100,auto> - the example will add a clip to the lower left.

## Template

Template authors can trigger the activation and deactivation of the plugins functionality with a custom event that can be triggered like the following example:

```
jQuery(function(){

    var layerAnimationMediaTrigger = function(){
        $('div.layeranimation').trigger('layeranimation.activate', [ $(this).hasClass('desktop') ] );
    };

    window.setTimeout(function(){
        $('.no.mediasize.mobile:visible,.no.mediasize.midsize:visible,.no.mediasize.desktop:visible')
        .livequery(layerAnimationMediaTrigger).each(layerAnimationMediaTrigger);
        }, 0);
    });
});
```

The requirements in this case are: three ``<div>`` elements with respective classes and styles that make the appear and disappear depending on the screen size. Furthermore it requires the [livequery plugin](http://docs.jquery.com/Plugins/livequery).

The effect would be, that the layeranimation plugin is enabled only for the desktop screen size.
