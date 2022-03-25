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

class syntax_plugin_layeranimation_animation extends DokuWiki_Syntax_Plugin {

    function getType(){ return 'container';}
    function getAllowedTypes() { return array('layer'); }
    function getPType(){ return 'block';}

    /**
     * Where to sort in?
     */
    function getSort(){ return 301; }

    /**
     * Connect pattern to lexer
     */
    function connectTo($mode) {       
      $this->Lexer->addEntryPattern('<animation>(?=.*?</animation>)',$mode,'plugin_layeranimation_animation');
      $this->Lexer->addEntryPattern('<animation .+?>(?=.*?</animation>)',$mode,'plugin_layeranimation_animation');
    }

    function postConnect() {
      $this->Lexer->addExitPattern('</animation.*?>', 'plugin_layeranimation_animation');
    }

    /**
     * Handle the match
     */
    function handle($match, $state, $pos, Doku_Handler $handler){

        switch ($state) {
            case DOKU_LEXER_ENTER:

                $option = array( 'height' => '200' );
                foreach ( explode(' ', substr($match, 11, -1)) as $item ) {
	                $isNumeric = is_numeric($item);
                    if ( $isNumeric || preg_match("/.*?(vw|vh|em)$/", $item) ) {
                    	if ( $isNumeric ) {
	                    	$item =  $item . 'px';
                    	}
                    
                        $option['height'] = hsc($item);
                    } else {
                        $option['class'] .= ' ' . hsc($item);
                    }
                }

                return array('animation__start', $option, $pos);
                break;

            case DOKU_LEXER_EXIT:

                return array('animation__end', null, $pos + strlen($match));
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

            list($instr, $data, $pos) = $input;

            switch ( $instr ) {

                case 'animation__start' :

                    $conf['layeranimation']['currentanimation']['height'] = $data['height'];
                    $renderer->doc .= '<noscript><div class="layeranimation_disabled"></div></noscript>';
                    $renderer->doc .= '<div class="layeranimation' . $data['class'] . ' noscripting' . (method_exists($renderer, "finishSectionEdit") ? ' ' . $renderer->startSectionEdit($pos, array( 'target' => 'section', 'name' => 'layeranimation')) : "") . '" style="height: ' . $data['height'] . '">' . "\n";

                    break;
                case 'animation__end' :

                    $renderer->doc .= '</div>' . "\n";
                    $renderer->doc .= '<div class="clearer"></div>' . "\n";
                    if ( method_exists($renderer, "finishSectionEdit") ) { $renderer->finishSectionEdit($pos); }

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
