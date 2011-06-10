#!/usr/bin/env php
<?php

if (!$lines = file('index-mac.html')) {
	fail('could not read index-mac.html');
}

$buf = '';
$script = '';
$marker = false;

foreach ($lines as $line) {
	if (strpos($line, '<script src="') === 0) {
		$c = substr($line, strpos($line, '"') + 1);
		$c = substr($c, 0, strpos($c, '"'));
		$script .= file_get_contents($c);

		if (!$marker) {
			$buf .= '<script>$SCRIPT$</script>';
			$marker = true;
		}

		continue;
	}

	$buf .= $line;
}

if (!file_put_contents('/tmp/script.js', $script)) {
	fail('could not write script.js');
}

@unlink('/tmp/script.min.js');

run('cat /tmp/script.js | java -jar /Users/seb/code/lib/yuicompressor-2.4.6.jar --type js > /tmp/script.min.js');

$buf = str_replace('$SCRIPT$', file_get_contents('/tmp/script.min.js'), $buf);

if (!file_put_contents('../p4-mac/game.html', $buf)) {
	fail('could not write game.html');
}

unlink('/tmp/script.js');
unlink('/tmp/script.min.js');

echo "\nDONE\n";

function run($cmd)
{
	echo "$cmd\n";
	@system($cmd, $r);
	
	if ($r != 0) {
		echo "FAILED: cmd returned $r\n";
		exit(1);
	}

}

function fail($msg)
{
	echo "FAILED $msg\n";
	exit(1);
}

