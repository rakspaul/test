module DomainHelper
  def domain_desk?
    return @domain_desk if defined?(@domain_desk)
    # invoking this method from decorators where we don't have request
    @domain_desk =  if Thread.current[:request].host.match(/localhost/)
                      ENV['DEPLOY_ENV'] == Role::CDESK
                    else
                      request.host.match(/desk/)
                    end
  end

  def domain_reach?
    return @domain_reach if defined?(@domain_reach)
    @domain_reach = if Thread.current[:request].host.match(/localhost/)
                      ENV['DEPLOY_ENV'] == Role::REACH_UI
                    else
                      request.host.match(/reach/)
                    end
  end
end