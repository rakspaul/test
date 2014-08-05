require 'digest/sha1'

class ActivityAttachment < ActiveRecord::Base

  ATTACHMENTS_REL_PATH = '/private/uploads/reach/activity/attachments'

  # attr_accessible :uploaded_file

  belongs_to :activity_log, :polymorphic => true
  belongs_to :user

  validates :original_filename, :presence => true

  before_save :generate_file_hash, :if => lambda { self.uploaded_file.present? }

  after_save :save_uploaded_file, :if => lambda { self.uploaded_file.present? }

  def absolute_path
    "#{storage_path}/#{self.id}_#{self.file_hash}"
  end

  def storage_path
    self.class.storage_path
  end

  def self.storage_path
    @@path ||= Pathname.new("#{Rails.root.to_s}#{ATTACHMENTS_REL_PATH}").realpath.tap do |fp|
                 Rails.logger.error "Activity attachments path #{fp} doesn't exist" unless File.exists?(fp)
               end
  end

  def uploaded_file
    @uploaded_file
  end

  def uploaded_file=(val)
    @uploaded_file = val
  end

  def self.generate_file_hash file_path
    Digest::SHA1.file(file_path).hexdigest
  end

  private

  def save_uploaded_file
    File.open(self.absolute_path, 'wb') do |f|
      f.write(self.uploaded_file.read)
    end if self.uploaded_file.present?
  end

  def generate_file_hash
    self.file_hash = self.class.generate_file_hash(self.uploaded_file.tempfile.path)
  end
end