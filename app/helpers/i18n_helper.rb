module I18nHelper

  CONVENTION_MARKETER = "marketer"
  CONVENTION_AGENCY = "agency"

  def identifier
    if domain_desk?
      if current_user.network_user? || current_user.marketer_user?
        CONVENTION_MARKETER
      end
    else
      if current_user.network_user? || current_user.agency_user?
        CONVENTION_AGENCY
      end
    end
  end

  def convention_agency
    CONVENTION_AGENCY
  end

  def convention_marketer
    CONVENTION_MARKETER
  end

  def localised(text)
    I18n.t(text)
  end

end