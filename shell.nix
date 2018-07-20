with (import <nixpkgs> {});

mkShell {
    buildInputs = [go-ethereum nodejs-8_x nodePackages_8_x.pnpm nodePackages_8_x.mocha];
}
