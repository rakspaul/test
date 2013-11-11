require 'bunny'
require 'yaml'

config  = YAML.load_file Rails.root.join('config', 'rabbitmq.yml')
env     = Rails.env.to_s

RABBITMQ_HOST     = config[env]["host"]     || ENV['rabbitmq_host']      || '127.0.0.1'
RABBITMQ_VHOST    = config[env]["vhost"]    || ENV['rabbitmq_vhost']     || "/"
RABBITMQ_USER     = config[env]["username"] || ENV['rabbitmq_user']      || "guest"
RABBITMQ_PASSWORD = config[env]["password"] || ENV['rabbitmq_password']  || "guest"

class RabbitMQWrapper
  def initialize(options)
    @connection = Bunny.new(:host => RABBITMQ_HOST, :vhost => RABBITMQ_VHOST, :user => RABBITMQ_USER, :password => RABBITMQ_PASSWORD)
    @connection.start

    channel = @connection.create_channel
    @queue = channel.queue(options[:queue], :durable => true)
  end

  def publish(msg)
    @queue.publish(msg, :persistent => true)
    Rails.logger.warn "[#{@queue.name}] Sent #{msg}"
  end

  def close
    @connection.close
  end
end
