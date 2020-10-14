<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153
{
    public static $files = array (
        '2cffec82183ee1cea088009cef9a6fc3' => __DIR__ . '/..' . '/ezyang/htmlpurifier/library/HTMLPurifier.composer.php',
    );

    public static $prefixLengthsPsr4 = array (
        'G' => 
        array (
            'Gregwar\\Captcha\\' => 16,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Gregwar\\Captcha\\' => 
        array (
            0 => __DIR__ . '/..' . '/gregwar/captcha',
        ),
    );

    public static $prefixesPsr0 = array (
        'P' => 
        array (
            'Playsms\\' => 
            array (
                0 => __DIR__ . '/..' . '/playsms/tpl/src',
                1 => __DIR__ . '/..' . '/playsms/webservices/src',
            ),
        ),
        'H' => 
        array (
            'HTMLPurifier' => 
            array (
                0 => __DIR__ . '/..' . '/ezyang/htmlpurifier/library',
            ),
        ),
        'D' => 
        array (
            'DB' => 
            array (
                0 => __DIR__ . '/..' . '/pear/db',
            ),
        ),
        'C' => 
        array (
            'Console' => 
            array (
                0 => __DIR__ . '/..' . '/pear/console_getopt',
            ),
        ),
    );

    public static $fallbackDirsPsr0 = array (
        0 => __DIR__ . '/..' . '/pear/pear-core-minimal/src',
    );

    public static $classMap = array (
        'PEAR_Exception' => __DIR__ . '/..' . '/pear/pear_exception/PEAR/Exception.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153::$prefixDirsPsr4;
            $loader->prefixesPsr0 = ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153::$prefixesPsr0;
            $loader->fallbackDirsPsr0 = ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153::$fallbackDirsPsr0;
            $loader->classMap = ComposerStaticInit86309e5b2a3dd95a6f714e55423e2153::$classMap;

        }, null, ClassLoader::class);
    }
}