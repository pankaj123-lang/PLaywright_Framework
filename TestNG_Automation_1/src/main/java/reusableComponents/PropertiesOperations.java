package reusableComponents;

import java.io.FileInputStream;
import java.util.Properties;

import org.apache.commons.lang3.StringUtils;

public class PropertiesOperations {
	static Properties properties = new Properties();
	public static String getProprtyValueByKey(String key) throws Exception {

		String proPath = System.getProperty("user.dir") + "/Resources/config.properties";
		FileInputStream fis = new FileInputStream(proPath);
		properties.load(fis);
		String value = properties.getProperty(key);
		if(StringUtils.isEmpty(value)) {
			throw new Exception("Value is not specified for key "+key+" in properties file");
		}
		return value;
	}

}
