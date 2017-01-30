<?php

//хеш файлов, меняется при внесении изменений
$dir1 = "js/";
//
$files_array = dirlist($dir1);
$hash = md5(implode(':',$files_array));

// возвращает массив всех файлов директории вкл файлы пддиректорий
function dirlist($dir){ 
  
  $files = array();
  
  if (@is_dir($dir)) {
    $opendir = opendir($dir);
      while ( ($filename = readdir($opendir)) !== false )
      {
        if($filename != '.' && $filename != '..'){
          $isDir = @is_dir($dir . $filename . "/");
          if ($isDir == false)
          {
              $fileHash = filemtime(strtolower($dir . $filename));
              $files[] = $fileHash;
          } else {
             $files = array_merge($files, dirlist($dir . $filename . "/"));
          }
        }
      }
      closedir($opendir);
  }
   return $files;
}
// возвращает массив всех файлов директории
function filelist($dir){
  $files= array();
  
  $opendir = opendir($dir);

  while ($filename = readdir($opendir))
  {

      $isDir = @is_dir($dir . $filename . '/');
      if ($isDir == false)
      {
          $fileHash = filemtime(strtolower($dir . $filename));
          $files[] = $fileHash;
      } 
  }

  closedir($opendir);

  return $files;
}
?>

<script> 
  var HASH = "<?php echo $hash;?>";
</script>