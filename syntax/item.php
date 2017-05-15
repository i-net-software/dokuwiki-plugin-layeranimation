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

class syntax_plugin_layeranimation_item extends DokuWiki_Syntax_Plugin {

    function getType(){ return 'item';}
    function getAllowedTypes() { return array('container','substition','protected','disabled','formatting','paragraphs'); }
    function getPType(){ return 'block';}

    /**
     * Where to sort in?
     */
    function getSort(){ return 301; }

    /**
     * Connect pattern to lexer
     */
    function connectTo($mode) {       
      $this->Lexer->addEntryPattern('<item>(?=.*?</item>)',$mode,'plugin_layeranimation_item');
      $this->Lexer->addEntryPattern('<item .+?>(?=.*?</item>)',$mode,'plugin_layeranimation_item');
    }

    function postConnect() {
      $this->Lexer->addExitPattern('</item.*?>', 'plugin_layeranimation_item');
    }

    /**
     * Handle the match
     */
    function handle($match, $state, $pos, Doku_Handler $handler){

        switch ($state) {
            case DOKU_LEXER_ENTER:

                list ($option, $clip) = explode('?', substr($match, 6, -1), 2);

                return array('item__start', array('option' => explode(' ', $option), 'clip' => explode(':', $clip)));
                break;

            case DOKU_LEXER_UNMATCHED:

                $handler->_addCall('cdata',array($match), $pos);
                return false;
                break;
            case DOKU_LEXER_EXIT:

                return array('item__end', null);
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

                case 'item__start' :

                    $CSSOption = '';
                    $ClassOption = '';
                    $ClipOption = array();
                    foreach ( $data['option'] as $item ) {

                       $subItem = explode(':', $item, 2);
                       if ( count($subItem) == 1 )
                       {
                           $ClassOption .= ' ' . hsc(trim($item));
                       } else {
                           $CSSOption .= ' ' . hsc(trim($item));
                       }

                    }

                    foreach ( $data['clip'] as $item ) {
                        $item = hsc(trim($item));
                        if ( $item == 'auto' ) 
                            $ClipOption[] = $item;
                        else if ( is_numeric($item) ) 
                            $ClipOption[] = intval($item) . 'px';
                    }

                    if ( !empty($ClipOption) && count($ClipOption) == 4 ) {
                        $ClipOption = 'clip:rect(' . implode(',', $ClipOption) . ');';
                    } else $ClipOption = '';

                    $renderer->doc .= '<div class="item' . $ClassOption . '" style="' . $ClipOption . $CSSOption . '">' . "\n";

                    break;
                case 'item__end' :

                    $renderer->doc .= '</div>' . "\n";

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
