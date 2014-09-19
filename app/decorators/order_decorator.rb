class OrderDecorator < Draper::Decorator
  include I18nHelper

  delegate_all

  def delete_checkbox
    dis = (object.io_detail.nil? or is_pushed?)
    h.check_box_tag "delete_order", object.id, false, class: "ordersCheckbox", disabled: dis
  end

  def order_status
    object.io_detail.try(:state_desc) || h.content_tag(:span, "Not in OM", class:'not-in-om')
  end

  def order_id_and_source_id_column
    ids = if h.current_user.agency_user?
      order_id_link
    else
      order_id_link + " / " + source_id_link
    end

    ids + h.content_tag(:div, class: 'import-datetime') do
      h.format_date(object.latest_import_or_push_note.try(:created_at))
    end
  end

  def order_name_column
    h.content_tag(:div, class: 'order-title') do
      link = convention_marketer? ? h.order_path(order) : h.order_path(order)
      h.link_to object.name, link
    end + first_note
  end

  def first_note
    note = object.order_activity_logs.last.try(:note)
    h.content_tag(:div, title: note, class: "order-note", "data-toggle" => "tooltip",
        "data-placement" => "right", :rel => "tooltip") do
      note
    end
  end

  def reach_client_name
    object.io_detail.try(:reach_client).try(:name)
  end

  def reach_client_abbr
    object.io_detail.try(:reach_client).try(:abbr)
  end

  def client_advertiser_name
    object.io_detail.try(:client_advertiser_name)
  end

  def account_manager_column
    assigned_tag = ""
    if order.user.present? and order.io_detail.try(:account_manager) == order.user
      assigned_tag = h.content_tag(:div, 'Assigned', class: 'order-note')
    end

    h.content_tag(:div, object.io_detail.try(:account_manager).try(:full_name)) + assigned_tag
  end

  def trafficker_column
    assigned_tag = ""
    if order.user.present? and order.io_detail.try(:trafficking_contact) == order.user
      assigned_tag = h.content_tag(:div, 'Assigned', class: 'order-note')
    end

    h.content_tag(:div, object.io_detail.try(:trafficking_contact).try(:full_name)) + assigned_tag
  end

  def start_date
    h.format_date(object.start_date)
  end

  def end_date
    h.format_date(object.end_date)
  end

  def is_pushed?
    !order.source_id.starts_with? 'R'
  end

  private
    def order_id_link
      h.content_tag(:span, class: 'amp-id', title: 'AMP ID') do
        link = convention_marketer? ? h.order_path(order) : h.order_path(order)
        h.link_to object.id, link
      end
    end

    def source_id_link
      title = is_pushed? ? 'DFP Order ID' : 'Not Pushed'
      css_class = is_pushed? ? 'dfp-id' : 'amp-id'

      h.content_tag(:span, class: css_class, title: title) do
        if is_pushed?
          h.link_to object.source_id, object.dfp_url, target: '_blank'
        else
          "NP"
        end
      end
    end
end
