<?php
/**
 * Imageflow Plugin
 * 
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     i-net software <tools@inetsoftware.de>
 * @author     Gerry Weissbach <gweissbach@inetsoftware.de>
 */

if(!defined('DOKU_INC')) die();
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_layeranimation_layer extends DokuWiki_Syntax_Plugin {

    private $currentLayer = 0;

    function getType(){ return 'layer';}
    function getAllowedTypes() { return array('item'); }
    function getPType(){ return 'block';}

    /**
     * Where to sort in?
     */
    function getSort(){ return 301; }

    /**
     * Connect pattern to lexer
     */
    function connectTo($mode) {       
      $this->Lexer->addEntryPattern('<layer>(?=.*?</layer>)',$mode,'plugin_layeranimation_layer');
      $this->Lexer->addEntryPattern('<layer .+?>(?=.*?</layer>)',$mode,'plugin_layeranimation_layer');
    }

    function postConnect() {
      $this->Lexer->addExitPattern('</layer.*?>', 'plugin_layeranimation_layer');
    }

    /**
     * Handle the match
     */
    function handle($match, $state, $pos, Doku_Handler $handler){

        switch ($state) {
            case DOKU_LEXER_ENTER:

                $option = explode(' ', substr($match, 6, -1));
                return array('layer__start', $option);
                break;

            case DOKU_LEXER_EXIT:

                return array('layer__end', null);
                break;
        }       
        return false;
    }

    /**
    * Create output
    */
    function render($mode, Doku_Renderer $renderer, $input) {
        global $conf;
        if($mode == 'xhtml'){

            $renderer->nocache();

            list($instr, $data) = $input;

            switch ( $instr ) {

                case 'layer__start' :

                    $CSSoption = '';
                    $TIMING = 'timing="7"';
                    foreach ( $data as $item ) {

                        if ( substr($item, -1) == 's' && is_int(intval(substr($item, 0, -1))) ) 
                        {
                            $TIMING = 'timing="' . intval(substr($item, 0, -1)) . '"';
                        }

                        $CSSoption .= ' ' . hsc(trim($item));
                    }

                    if ( intval($conf['layeranimation']['currentanimation']['height']) > 0 )
                    {
                        $renderer->doc .= '<div type="layer" class="layer' . $CSSoption . '" style="height: ' . $conf['layeranimation']['currentanimation']['height'] . 'px" ' . $TIMING . '>' . "\n";
                    } else {
                        $renderer->doc .= '<div type="layer" class="layer' . $CSSoption . '" ' . $TIMING . '>' . "\n";
                    }

                    break;
                case 'layer__end' :

                    $renderer->doc .= '</div>' . "\n\n";

                    break;
                default :
                    return false;
            }
            return true;
        }
        return false;
    }
}

//Setup VIM: ex: et ts=4 enc=utf-8 :
