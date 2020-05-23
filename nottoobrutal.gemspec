# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "nottoobrutal"
  spec.version       = "0.1.0"
  spec.authors       = ["Drew Cutchins"]
  spec.email         = ["drew.cutch@gmail.com"]

  spec.summary       = "A barebones theme used by drewcutchins.com"
  spec.homepage      = "https://github.com/DrewCutch/plain-jekyll-theme"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README)!i) }

  spec.add_runtime_dependency "jekyll", "~> 4.0"

  spec.add_development_dependency "bundler", "~> 2.1.4"
  spec.add_development_dependency "rake", "~> 12.0"
end
