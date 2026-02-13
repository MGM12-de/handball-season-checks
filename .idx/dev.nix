# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs }: {
  # Which nixpkgs channel to use.
  channel = "stable-stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.corepack_latest
  ];
  # Sets environment variables in the workspace
  env = { };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "vue.volar"
      "Nuxt.mdc"
      "Nuxtr.nuxt-vscode-extentions"
      "Nuxtr.nuxtr-vscode"
      "bradlc.vscode-tailwindcss"
      "dbaeumer.vscode-eslint"
      "eamodio.gitlens"
      "vivaxy.vscode-conventional-commits"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        pnpm-install = "pnpm install";
        # Open editors for the following files by default, if they exist:
        default.openFiles = [ "app.vue" ];
      };
      # To run something each time the workspace is (re)started, use the `onStart` hook
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
          manager = "web";
        };
      };
    };
  };
}
