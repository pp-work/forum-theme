<?php if (!defined('APPLICATION')) exit();

$Controller = Gdn::Controller();
$Depth = property_exists($Controller, 'Category') ? GetValue('Depth', $Controller->Category, '') : '';
$Name = property_exists($Controller, 'Category') ? GetValue('Name', $Controller->Category, '') : '';
$ResolvedPath = property_exists($Controller, 'ResolvedPath') ? GetValue('ResolvedPath', $Controller, '') : '';

echo '<div class="BoxButtons BoxNewDiscussion">';
$Text = T('Start a New Discussion', 'New Discussion');
$UrlCode = GetValue('UrlCode', GetValue('Category', $Data), '');
$Url = '/post/discussion/'.$UrlCode;
if ($this->QueryString) {
   $Url .= (strpos($Url, '?') !== FALSE ? '&' : '?').$this->QueryString;
}
$Css = 'Button Primary Action NewDiscussion';
$Css .= strpos($this->CssClass, 'Big') !== FALSE ? ' BigButton' : '';
$Attr = array('title' => 'Skapa en tråd i '.$Name);
if ($Depth < 2 || $ResolvedPath == 'vanilla/post/discussion') {
    $Css .= ' disabled';
    $Attr['title'] = $Depth < 2 ? T('You cannot create a new discussion here.') : T('Click Post Discussion to post.');
    $Url = '#';
}
if (count($this->Buttons) == 0) {
   echo Anchor($Text, $Url, $Css, $Attr);
} else {
   // Make the core button action be the first item in the button group.
   array_unshift($this->Buttons, array('Text' => $Text, 'Url' => $Url));
   echo ButtonGroup($this->Buttons, $this->CssClass, $this->DefaultButton);
}
Gdn::Controller()->FireEvent('AfterNewDiscussionButton');

echo '</div>';
