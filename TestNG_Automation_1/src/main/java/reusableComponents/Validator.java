package reusableComponents;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import testBase.*;


public class Validator {
    private static WebElement webElement;

    public static void validateObjects(List<Map<String, String>> dataList) {
        for (Map<String, String> map : dataList) {  // Loop through each test step
            String action = map.get("performDS");

            if ("startbrowser".equalsIgnoreCase(action)) {
//                ActionMethods.startBrowser();
            } else {
                webElement = checkElementPresent(map);
                
                ActionClass.takeAction(map, webElement);
            }
        }
    }

    private static WebElement checkElementPresent(Map<String, String> map) {  // Changed from HashMap to Map
        WebElement webElementValue = null;
        WebDriverWait wait = new WebDriverWait(TestBase.getDriver(), Duration.ofSeconds(10));

        String objectType = map.get("objectTypeDS");
        String objectValue = map.get("objectDS");

        if (objectType == null || objectType.trim().isEmpty()) {
            System.out.println("Object Type field is Blank");
            return null;
        }

        objectType = objectType.toUpperCase().trim();

        try {
            switch (objectType) {
                case "ID":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.id(objectValue)));
                    break;
                case "XPATH":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(objectValue)));
                    break;
                case "CLASSNAME":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.className(objectValue)));
                    break;
                case "NAME":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.name(objectValue)));
                    break;
                case "CSS":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(objectValue)));
                    break;
                case "LINKTEXT":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.linkText(objectValue)));
                    break;
                case "PARTIALLINKTEXT":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.partialLinkText(objectValue)));
                    break;
                case "TAGNAME":
                    webElementValue = wait.until(ExpectedConditions.presenceOfElementLocated(By.tagName(objectValue)));
                    break;
                case "FRAMEINDEX":
                    TestBase.getDriver().switchTo().frame(Integer.parseInt(objectValue));
                    return null;
                case "FRAMENAME":
                case "FRAMEID":
                case "FRAMEXPATH":
                    WebElement frame = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(objectValue)));
                    TestBase.getDriver().switchTo().frame(frame);
                    return null;
                default:
                    System.out.println("Unsupported object type: " + objectType);
            }
        } catch (Exception e) {
            System.out.println("Element not present on the screen: " + objectValue);
        }

        if (webElementValue != null) {
            JavascriptExecutor js = (JavascriptExecutor) TestBase.getDriver();
            js.executeScript("arguments[0].style.border='1.5px solid limegreen'", webElementValue);
        }
        return webElementValue;
    }
}
