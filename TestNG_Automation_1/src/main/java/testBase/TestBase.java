package testBase;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class TestBase {
    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();

    // ✅ Launch browser in a thread-safe way
    public void launchBrowser(String browser) {
        WebDriver localDriver;
        if (browser.equalsIgnoreCase("chrome")) {
            WebDriverManager.chromedriver().setup();
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--remote-allow-origins=*");
            localDriver = new ChromeDriver(options);
        } else if (browser.equalsIgnoreCase("firefox")) {
            WebDriverManager.firefoxdriver().setup();
            localDriver = new FirefoxDriver();
        } else {
            throw new IllegalArgumentException("Unsupported browser: " + browser);
        }
        
        driver.set(localDriver);
        getDriver().manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        getDriver().manage().window().maximize();
    }

    // ✅ **Thread-safe way to get WebDriver**
    public static WebDriver getDriver() {
        return driver.get();
    }

    // ✅ Quit browser for current thread only
    public void closeDriver() {
        if (driver.get() != null) {
            driver.get().quit();
            driver.remove();
        }
    }
}
