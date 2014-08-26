module I18nHelper

  CONVENTION_MARKETER = "marketer"
  CONVENTION_AGENCY = "agency"

  def identifier
    if domain_desk?
      CONVENTION_MARKETER
    elsif domain_reach?
      CONVENTION_AGENCY
    else
      if current_user.has_roles?([Role::REACH_UI])
        CONVENTION_AGENCY
      elsif current_user.has_roles?([Role::CDESK])
        CONVENTION_MARKETER
      else
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