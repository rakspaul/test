require 'bunny'

RABBITMQ_HOST     = ENV['rabbitmq_host']      || '127.0.0.1'
RABBITMQ_VHOST    = ENV['rabbitmq_vhost']     || "/"
RABBITMQ_USER     = ENV['rabbitmq_user']      || "reach"
RABBITMQ_PASSWORD = ENV['rabbitmq_password']  || "asd234f#dg"

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
