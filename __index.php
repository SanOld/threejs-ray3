<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>	Smeta </title>

<script type="text/javascript">

window.addEventListener('message', function(event) {
    {
        if (event.data.message.cmd == 'get_data')
        {
            var win = window.frames.fr1;
            json_mess = {
                data:  {},
                cmd: 'put_data'
            }
            win.postMessage({message: json_mess}, event.origin);
        }
        if (event.data.message.cmd == 'put_data')
        {
            //alert('Received message1: ' + event.data.message.data);
			//console.log(event.data.message.data);
			console.log(JSON.stringify(event.data.message.data));
            document.getElementById('iframeid').remove();
        }
        if (event.data.message.cmd == 'ready')
        {
			console.log('ready');
        }
        if (event.data.message.cmd == 'cancel')
        {
            document.getElementById('iframeid').remove();
        }
    }
}, false);

function setFocusThickboxIframe(iframe) {
    //var iframe = $("#TB_iframeContent")[0];
    //iframe.contentWindow.focus();
	iframe.focus();
}

function load() {
    var win = window.frames.fr1;
	setFocusThickboxIframe(win);
    win.postMessage({message: {cmd: 'put_data', data: {} }}, '*');
}
</script>
</head>
<body>

<iframe onload="load(this)" name="fr1"  id="iframeid"  scrolling="auto" style="width:99%;height:99%" src="http://widgets.online.cad5d.ru/release/wall3d/index.php?lang=ru&measure=METRIC&time=<?php echo time();?>"></iframe>
<!-- lang=en   measure=INCH -->
</body>
</html>