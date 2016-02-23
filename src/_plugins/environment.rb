# Plugin to add environment variables to the `site` object in Liquid templates

module Jekyll
  class EnvironmentVariablesGenerator < Generator
    def generate(site)
      site.config['env'] = ENV['JEKYLL_ENV'] || 'development'
      # site.config['bartnet_api_host'] = ENV['BARTNET_HOST'] || 'api-beta.opsee.co'
      # site.config['bartnet_api_port'] = ENV['BARTNET_PORT'] || '80'
    end
  end
end
