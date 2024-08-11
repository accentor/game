require 'base64'
require 'csv'
require 'json'

def main(input, output)
  CSV.open(output, 'w', col_sep: ';') do |writer|
    CSV.open(input, 'r', headers: true, col_sep: ';', return_headers: true) do |reader|
      # Read the first line to print headers
      reader.readline
      writer << reader.headers + ['#qr_code']

      arr = []
      reader.each do |row|
        next unless row['TrackID']

        code = JSON.generate({ __accentor_game: row['TrackID'] })
        arr << row.to_h.values + [Base64.strict_encode64(code)]
      end
      arr.shuffle.each do |row|
        writer << row
      end
    end
  end
end

main(ARGV[0], ARGV[1])