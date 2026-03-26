{
  description = "Node.js + Wrangler dev shell";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        name = "nodejs-wrangler-shell";

        buildInputs = [
          pkgs.nodejs
          pkgs.wrangler
        ];

        shellHook = ''
          if [ -f .env ]; then
            source .env
          fi
        '';
      };
    };
}
