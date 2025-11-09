{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.setuptools
    pkgs.python311Packages.wheel
    pkgs.ffmpeg
    pkgs.portaudio
    pkgs.pkg-config
    pkgs.gcc
    pkgs.alsa-lib
    pkgs.pulseaudio
    pkgs.libsndfile
    pkgs.curl
    pkgs.wget
  ];
  
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
      pkgs.zlib
      pkgs.glib
      pkgs.alsa-lib
      pkgs.libsndfile
    ];
    PYTHONHOME = "${pkgs.python311}";
    PYTHONPATH = "${pkgs.python311}/lib/python3.11/site-packages";
  };
}