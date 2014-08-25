module DomainHelper
  def domain_desk?
    if request.host.match(/localhost/)
      return false
    end
    return request.host.match(/desk/)
  end

  def domain_reach?
    if request.host.match(/localhost/)
      return true
    end
    return request.host.match(/reach/)
  end
end